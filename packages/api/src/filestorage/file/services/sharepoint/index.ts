import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SharepointFileOutput } from './types';
import { SharepointService as SharepointFolderService } from '@filestorage/folder/services/sharepoint';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Connection } from '@@core/connections/@utils/types';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { SharepointPermissionOutput } from '@filestorage/permission/services/sharepoint/types';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';

@Injectable()
export class SharepointService implements IFileService {
  private readonly MAX_RETRIES: number = 6;
  private readonly INITIAL_BACKOFF_MS: number = 1000;
  private readonly BATCH_SIZE: number = 20;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
    private sharepointFolderService: SharepointFolderService,
    private bullQueueService: BullQueueService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(
    data: SyncParam,
    deltaLink?: string,
  ): Promise<ApiResponse<SharepointFileOutput[]>> {
    try {
      const { linkedUserId, custom_field_mappings, ingestParams, id_folder } =
        data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      // if id_folder is provided, sync only the files in the specified folder
      if (id_folder) {
        const folder = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: id_folder as string,
          },
          select: {
            remote_id: true,
          },
        });
        if (folder) {
          const files = await this.syncFolder(connection, folder.remote_id);
          return {
            data: files,
            message: 'SharePoint files retrieved from specified folder',
            statusCode: 200,
          };
        }
      }

      // if deltaLink is provided
      if (deltaLink) {
        this.logger.log(
          `Syncing SharePoint files from deltaLink: ${deltaLink}`,
        );
        let files: SharepointFileOutput[] = [];
        let nextDeltaLink: string | null = null;
        try {
          const { files: batchFiles, nextDeltaLink: batchNextDeltaLink } =
            await this.getFilesToSync(connection, deltaLink, 10);

          files = batchFiles;
          nextDeltaLink = batchNextDeltaLink;
        } catch (error: any) {
          if (error.response?.status === 410) {
            // Delta token expired, start fresh sync
            const newDeltaLink = `${connection.account_url}/drive/root/delta?$top=1000`;
            return this.sync(data, newDeltaLink);
          }
          await this.bullQueueService
            .getSyncJobsQueue()
            .add('fs_file_sharepoint', {
              ...data,
              deltaLink: deltaLink,
              connectionId: connection.id_connection,
            });

          this.logger.error(
            `Got 410 error while syncing SharePoint files. Added sync from /delta endpoint to queue to retry.`,
            error,
          );
        }

        if (files.length > 0) {
          const ingestedFiles = await this.ingestFiles(
            files,
            connection,
            custom_field_mappings,
            ingestParams,
          );

          this.logger.log(
            `Ingested ${ingestedFiles.length} files from SharePoint.`,
          );
        }

        // more files to sync
        if (nextDeltaLink) {
          await this.bullQueueService
            .getThirdPartyDataIngestionQueue()
            .add('fs_file_sharepoint', {
              ...data,
              deltaLink: nextDeltaLink,
              connectionId: connection.id_connection,
            });
        } else {
          this.logger.log(`No more files to sync from SharePoint.`);
        }
      } else {
        const lastSyncTime = await this.getLastSyncTime(
          connection.id_connection,
        );
        const deltaLink = lastSyncTime
          ? `${
              connection.account_url
            }/drive/root/delta?$top=1000&token=${lastSyncTime.toISOString()}`
          : `${connection.account_url}/drive/root/delta?$top=1000`;

        await this.sync(data, deltaLink);
      }

      return {
        data: [],
        message: 'SharePoint files retrieved',
        statusCode: 200,
      };
    } catch (error: any) {
      this.logger.error(
        `Error syncing SharePoint files: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private async getFilesToSync(
    connection: Connection,
    deltaLink: string,
    maxApiCalls: number,
  ) {
    const files: SharepointFileOutput[] = [];
    let nextDeltaLink: string | null = deltaLink;

    for (let i = 0; i < maxApiCalls; i++) {
      const resp = await this.makeRequestWithRetry({
        timeout: 30000,
        method: 'get',
        url: deltaLink,
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const batchFiles = resp.data.value?.filter((elem: any) => !elem.folder);
      files.push(...batchFiles);
      nextDeltaLink = resp.data['@odata.nextLink'];

      if (!resp.data.value?.length) {
        nextDeltaLink = null;
        break;
      }
    }

    return { files, nextDeltaLink };
  }

  async processBatch(job: any) {
    const {
      linkedUserId,
      deltaLink,
      connectionId,
      custom_field_mappings,
      ingestParams,
    } = job.data;

    await this.sync(
      {
        linkedUserId,
        custom_field_mappings,
        ingestParams,
      },
      deltaLink,
    );
  }

  private async ingestFiles(
    files: SharepointFileOutput[],
    connection: Connection,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    extraParams?: { [key: string]: any },
  ) {
    // Sort files by lastModifiedDateTime in descending order (newest first)
    const sortedFiles = [...files].sort((a, b) => {
      const dateA = new Date(a.lastModifiedDateTime).getTime();
      const dateB = new Date(b.lastModifiedDateTime).getTime();
      return dateB - dateA;
    });

    // Deduplicate files by remote_id, keeping only the first occurrence (which will be the latest version)
    const uniqueFiles = sortedFiles.reduce((acc, file) => {
      if (!acc.has(file.id)) {
        acc.set(file.id, file);
      }
      return acc;
    }, new Map<string, SharepointFileOutput>());

    this.logger.log(
      `Deduplicating ${files.length} delta files to ${uniqueFiles.size} unique files`,
      'sharepoint files ingestion',
    );

    await this.ingestPermissionsForFiles(
      Array.from(uniqueFiles.values()),
      connection,
    );

    return this.ingestService.ingestData<
      UnifiedFilestorageFileOutput,
      SharepointFileOutput
    >(
      Array.from(uniqueFiles.values()),
      'sharepoint',
      connection.id_connection,
      'filestorage',
      'file',
      customFieldMappings,
      extraParams,
    );
  }

  private async ingestPermissionsForFiles(
    allFiles: SharepointFileOutput[],
    connection: Connection,
  ): Promise<SharepointFileOutput[]> {
    const allPermissions: SharepointPermissionOutput[] = [];
    const fileIdToRemotePermissionIdMap: Map<string, string[]> = new Map();
    const batchSize = 4;

    const files = allFiles.filter((f) => !f.deleted);

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const permissions = await Promise.all(
        batch.map(async (file) => {
          const permissionConfig: AxiosRequestConfig = {
            timeout: 30000,
            method: 'get',
            url: `${connection.account_url}/drive/items/${file.id}/permissions`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          };

          const resp = await this.makeRequestWithRetry(permissionConfig);
          const permissions = resp.data.value;
          fileIdToRemotePermissionIdMap.set(
            file.id,
            permissions.map((p) => p.id),
          );
          return permissions;
        }),
      );

      this.delay(1000);

      allPermissions.push(...permissions.flat());
    }

    const uniquePermissions = Array.from(
      new Map(
        allPermissions.map((permission) => [permission.id, permission]),
      ).values(),
    );

    await this.assignUserAndGroupIdsToPermissions(uniquePermissions);

    const syncedPermissions = await this.ingestService.ingestData<
      UnifiedFilestoragePermissionOutput,
      SharepointPermissionOutput
    >(
      uniquePermissions,
      'sharepoint',
      connection.id_connection,
      'filestorage',
      'permission',
    );

    this.logger.log(
      `Ingested ${syncedPermissions.length} permissions for files.`,
    );

    const permissionIdMap: Map<string, string> = new Map(
      syncedPermissions.map((permission) => [
        permission.remote_id,
        permission.id_fs_permission,
      ]),
    );

    files.forEach((file) => {
      if (fileIdToRemotePermissionIdMap.has(file.id)) {
        file.internal_permissions = fileIdToRemotePermissionIdMap
          .get(file.id)
          ?.map((permission) => permissionIdMap.get(permission))
          .filter((id) => id !== undefined);
      }
    });

    return allFiles;
  }

  private async assignUserAndGroupIdsToPermissions(
    permissions: SharepointPermissionOutput[],
  ): Promise<void> {
    const userLookupCache: Map<string, string> = new Map();
    const groupLookupCache: Map<string, string> = new Map();

    for (const permission of permissions) {
      if (permission.grantedToV2?.user?.id) {
        const remote_user_id = permission.grantedToV2.user.id;
        if (userLookupCache.has(remote_user_id)) {
          permission.internal_user_id = userLookupCache.get(remote_user_id);
          continue;
        }
        const user = await this.prisma.fs_users.findFirst({
          where: {
            remote_id: remote_user_id,
          },
          select: {
            id_fs_user: true,
          },
        });
        if (user) {
          permission.internal_user_id = user.id_fs_user;
          userLookupCache.set(remote_user_id, user.id_fs_user);
        }
      }

      if (permission.grantedToV2?.group?.id) {
        const remote_group_id = permission.grantedToV2.group.id;
        if (groupLookupCache.has(remote_group_id)) {
          permission.internal_group_id = groupLookupCache.get(remote_group_id);
          continue;
        }
        const group = await this.prisma.fs_groups.findFirst({
          where: {
            remote_id: remote_group_id,
          },
          select: {
            id_fs_group: true,
          },
        });
        if (group) {
          permission.internal_group_id = group.id_fs_group;
          groupLookupCache.set(remote_group_id, group.id_fs_group);
        }
      }
    }
  }

  private async syncFolder(
    connection: any,
    folderId: string,
  ): Promise<SharepointFileOutput[]> {
    try {
      const config: AxiosRequestConfig = {
        timeout: 30000,
        method: 'get',
        url: `${connection.account_url}/drive/items/${folderId}/children`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const resp: AxiosResponse = await this.makeRequestWithRetry(config);

      const files: SharepointFileOutput[] = resp.data.value.filter(
        (elem: any) => !elem.folder,
      );

      await this.ingestPermissionsForFiles(files, connection);

      return files;
    } catch (error: any) {
      if (error.response?.status === 404) {
        const internalFolder = await this.prisma.fs_folders.findFirst({
          where: {
            remote_id: folderId,
            id_connection: connection.id_connection,
          },
          select: {
            id_fs_folder: true,
            remote_was_deleted: true,
          },
        });
        if (internalFolder && !internalFolder.remote_was_deleted) {
          this.logger.debug(
            `Folder ${internalFolder.id_fs_folder} not found in SharePoint, marking as deleted in internal database.`,
          );
          await this.sharepointFolderService.handleDeletedFolder(
            internalFolder.id_fs_folder,
            connection,
          );
        }
        return [];
      }
      throw error;
    }
  }

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_files.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: { sort: 'desc', nulls: 'last' } },
    });
    this.logger.log(`Last sync time: ${lastSync?.remote_modified_at}`);
    return lastSync ? lastSync.remote_modified_at : null;
  }

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${connection.account_url}/drive/items/${fileId}/content`,
      headers: {
        Authorization: `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`,
      },
      responseType: 'arraybuffer',
    };

    const response: AxiosResponse = await this.makeRequestWithRetry(config);
    return Buffer.from(response.data);
  }

  private async makeRequestWithRetry(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    let attempts = 0;
    let backoff: number = this.INITIAL_BACKOFF_MS;

    while (attempts < this.MAX_RETRIES) {
      try {
        const response: AxiosResponse = await axios(config);
        return response;
      } catch (error: any) {
        attempts++;

        // Handle rate limiting
        if (error.response && error.response.status === 429) {
          const retryAfter: number = this.getRetryAfter(
            error.response.headers['retry-after'],
          );
          const delayTime: number = Math.max(retryAfter * 1000, backoff);

          this.logger.warn(
            `Rate limit hit. Retrying request in ${delayTime}ms (Attempt ${attempts}/${this.MAX_RETRIES})`,
          );

          await this.delay(delayTime);
          backoff *= 2; // Exponential backoff
          continue;
        }

        // Handle timeout errors
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT' ||
          error.response?.code === 'ETIMEDOUT'
        ) {
          const delayTime: number = backoff;

          this.logger.warn(
            `Request timeout. Retrying in ${delayTime}ms (Attempt ${attempts}/${this.MAX_RETRIES})`,
          );

          await this.delay(delayTime);
          backoff *= 2;
          continue;
        }

        // Handle server errors (500+)
        if (error.response && error.response.status >= 500) {
          const delayTime: number = backoff;

          this.logger.warn(
            `Server error ${error.response.status}. Retrying in ${delayTime}ms (Attempt ${attempts}/${this.MAX_RETRIES})`,
          );

          await this.delay(delayTime);
          backoff *= 2;
          continue;
        }

        // handle 410 gone errors
        if (error.response?.status === 410 && config.url.includes('delta')) {
          // todo: handle 410 gone errors
        }

        throw error;
      }
    }

    this.logger.error(
      'Max retry attempts reached. Request failed.',
      SharepointService.name,
    );
    throw new Error('Max retry attempts reached.');
  }

  private getRetryAfter(retryAfterHeader: string | undefined): number {
    if (!retryAfterHeader) {
      return 1;
    }
    const retryAfterSeconds: number = parseInt(retryAfterHeader, 10);
    return isNaN(retryAfterSeconds) ? 1 : retryAfterSeconds;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
