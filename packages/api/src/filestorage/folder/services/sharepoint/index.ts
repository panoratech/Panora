import { Injectable } from '@nestjs/common';
import { IFolderService } from '@filestorage/folder/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SharepointFolderInput, SharepointFolderOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from '@@core/connections/@utils/types';
import { fs_folders } from '@prisma/client';
import { SharepointPermissionOutput } from '@filestorage/permission/services/sharepoint/types';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';

@Injectable()
export class SharepointService implements IFolderService {
  private readonly MAX_RETRIES: number = 6;
  private readonly INITIAL_BACKOFF_MS: number = 1000;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async addFolder(
    folderData: SharepointFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SharepointFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        return {
          data: null,
          message: 'Connection not found',
          statusCode: 404,
        };
      }

      const config: AxiosRequestConfig = {
        method: 'post',
        url: `${connection.account_url}/drive/items/${folderData.parentReference?.id}/children`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
        data: {
          name: folderData.name,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename',
        },
      };

      const response = await this.makeRequestWithRetry(config);

      return {
        data: response.data,
        message: 'SharePoint folder created successfully',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error('Error creating SharePoint folder', error);
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SharepointFolderOutput[]>> {
    try {
      this.logger.log('Syncing SharePoint folders');
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        throw new Error('SharePoint connection not found.');
      }

      const lastSyncTime = await this.getLastSyncTime(connection.id_connection);

      let folders;

      if (!lastSyncTime) {
        folders = await this.iterativeGetSharepointFolders(connection);
      } else {
        this.logger.log('Syncing SharePoint folders incrementally');
        folders = await this.incrementalGetSharepointFolders(
          connection,
          lastSyncTime,
        );
      }

      this.logger.log(`Ingesting permissions for ${folders.length} folders`);

      await this.ingestPermissionsForFolders(folders, connection);

      this.logger.log(
        `${folders.length} SharePoint folders synced successfully.`,
      );

      return {
        data: folders,
        message: 'SharePoint folders synced',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('Error in SharePoint sync:', error);
      throw error;
    }
  }

  async iterativeGetSharepointFolders(
    connection: Connection,
  ): Promise<SharepointFolderOutput[]> {
    const result: SharepointFolderOutput[] = [];

    // Get root folder first
    const rootConfig: AxiosRequestConfig = {
      timeout: 30000,
      method: 'get',
      url: `${connection.account_url}/drive/root/children`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`,
      },
    };

    const rootResp = await this.makeRequestWithRetry(rootConfig);
    const rootFolders: SharepointFolderOutput[] = rootResp.data.value.filter(
      (driveItem: any) => driveItem.folder,
    );

    result.push(
      ...rootFolders.map((f) => ({
        ...f,
        internal_id: uuidv4(),
        internal_parent_folder_id: null,
      })),
    );

    let batch = rootFolders.map((folder) => ({
      remote_folder_id: folder.id,
      internal_id: folder.internal_id,
      internal_parent_folder_id: null,
    }));

    while (batch.length > 0) {
      const nestedFoldersPromises = batch.map(
        async (folder: {
          remote_folder_id: string;
          internal_id: string;
          internal_parent_folder_id: string | null;
        }) => {
          try {
            const childrenConfig: AxiosRequestConfig = {
              timeout: 30000,
              method: 'get',
              url: `${connection.account_url}/drive/items/${folder.remote_folder_id}/children`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            };

            const resp = await this.makeRequestWithRetry(childrenConfig);
            const folders: SharepointFolderOutput[] = resp.data.value.filter(
              (driveItem: any) => driveItem.folder,
            );

            return folders.map((f) => ({
              ...f,
              internal_id: uuidv4(),
              internal_parent_folder_id: folder.internal_id,
            }));
          } catch (error: any) {
            if (error.response?.status === 404) {
              const f = await this.prisma.fs_folders.findFirst({
                where: {
                  remote_id: folder.remote_folder_id,
                  id_connection: connection.id_connection,
                },
                select: {
                  id_fs_folder: true,
                },
              });
              await this.handleDeletedFolder(f.id_fs_folder, connection);
              return [];
            }
            throw error;
          }
        },
      );

      const nestedFolders = await Promise.all(nestedFoldersPromises);
      result.push(...nestedFolders.flat());

      batch = nestedFolders.flat().map((folder) => ({
        remote_folder_id: folder.id,
        internal_id: folder.internal_id,
        internal_parent_folder_id: folder.internal_parent_folder_id,
      }));

      if (batch.length > 0) {
        await this.delay(1000); // Prevent rate limiting
      }
    }

    return result;
  }

  async incrementalGetSharepointFolders(
    connection: Connection,
    lastSyncTime: Date,
  ): Promise<SharepointFolderOutput[]> {
    let deltaLink = `${
      connection.account_url
    }/drive/root/delta?token=${lastSyncTime.toISOString()}`;

    const deltaConfig: AxiosRequestConfig = {
      timeout: 30000,
      method: 'get',
      url: deltaLink,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`,
      },
    };

    const sharepointFolders: SharepointFolderOutput[] = [];

    do {
      const deltaResponse = await this.makeRequestWithRetry(deltaConfig);
      if (!deltaResponse.data.value) {
        break;
      }
      deltaLink = deltaResponse.data.deltaLink;
      sharepointFolders.push(
        ...deltaResponse.data.value.filter((f: any) => f.folder),
      );
    } while (deltaLink);

    // Sort folders by lastModifiedDateTime in descending order (newest first)
    const sortedFolders = [...sharepointFolders].sort((a, b) => {
      const dateA = new Date(a.lastModifiedDateTime).getTime();
      const dateB = new Date(b.lastModifiedDateTime).getTime();
      return dateB - dateA;
    });

    const uniqueFolders = sortedFolders.reduce((acc, folder) => {
      if (!acc.has(folder.id)) {
        acc.set(folder.id, folder);
      }
      return acc;
    }, new Map<string, SharepointFolderOutput>());

    const deletedFolders = Array.from(uniqueFolders.values()).filter(
      (f) => f.deleted,
    );
    const updatedFolders = Array.from(uniqueFolders.values()).filter(
      (f) => !f.deleted,
    );

    const foldersToSync = await this.assignParentIds(
      updatedFolders,
      connection,
    );

    return [...foldersToSync, ...deletedFolders];
  }

  private async assignParentIds(
    folders: SharepointFolderOutput[],
    connection: Connection,
  ): Promise<SharepointFolderOutput[]> {
    const folderIdToInternalIdMap: Map<string, string> = new Map();
    const foldersToSync: SharepointFolderOutput[] = [];
    let remainingFolders: SharepointFolderOutput[] = [...folders];
    const parentLookupCache: Map<string, string | null> = new Map();

    while (remainingFolders.length > 0) {
      const foldersStillPending: SharepointFolderOutput[] = [];

      for (const folder of remainingFolders) {
        const parentId = folder.parentReference?.id || 'root';
        const internalParentId = await this.resolveParentId(
          parentId,
          folderIdToInternalIdMap,
          connection.id_connection,
          parentLookupCache,
        );

        if (internalParentId) {
          const folder_internal_id = await this.getIntenalIdForFolder(
            folder.id,
            connection,
          );
          foldersToSync.push({
            ...folder,
            internal_parent_folder_id:
              internalParentId === 'root' ? null : internalParentId,
            internal_id: folder_internal_id,
          });
          folderIdToInternalIdMap.set(folder.id, folder_internal_id);
        } else {
          foldersStillPending.push(folder);
        }
      }

      if (foldersStillPending.length === remainingFolders.length) {
        const remote_folders = new Map(
          foldersToSync.map((folder) => [folder.id, folder]),
        );

        await this.handleUnresolvedFolders(
          foldersStillPending,
          foldersToSync,
          remote_folders,
          parentLookupCache,
          folderIdToInternalIdMap,
          connection,
        );
        break;
      }

      remainingFolders = foldersStillPending;
    }

    return foldersToSync;
  }

  private async getIntenalIdForFolder(
    folderId: string,
    connection: Connection,
  ): Promise<string> {
    const folder = await this.prisma.fs_folders.findFirst({
      where: { remote_id: folderId, id_connection: connection.id_connection },
      select: { id_fs_folder: true },
    });
    return folder?.id_fs_folder || uuidv4();
  }

  private async resolveParentId(
    parentId: string,
    idMap: Map<string, string>,
    connectionId: string,
    cache: Map<string, string | null>,
  ): Promise<string | null> {
    if (parentId === 'root') return 'root';
    if (cache.has(parentId)) return cache.get(parentId)!;
    if (idMap.has(parentId)) return idMap.get(parentId)!;

    const folder = await this.prisma.fs_folders.findFirst({
      where: {
        remote_id: parentId,
        id_connection: connectionId,
      },
      select: {
        id_fs_folder: true,
      },
    });

    const result = folder?.id_fs_folder || null;
    cache.set(parentId, result);
    return result;
  }

  private async handleUnresolvedFolders(
    pending: SharepointFolderOutput[],
    output: SharepointFolderOutput[],
    remote_folders: Map<string, SharepointFolderOutput>,
    parentLookupCache: Map<string, string | null>,
    idCache: Map<string, string | null>,
    connection: Connection,
  ): Promise<void> {
    this.logger.warn(
      `${pending.length} folders could not be resolved in the initial pass. Attempting to resolve remaining folders.`,
    );

    const getInternalParentRecursive = async (
      folder: SharepointFolderOutput,
      visitedIds: Set<string> = new Set(),
    ): Promise<string | null> => {
      const remote_parent_id = folder.parentReference?.id || 'root';

      if (visitedIds.has(remote_parent_id)) {
        this.logger.warn(`Circular reference detected for folder ${folder.id}`);
        return null;
      }

      visitedIds.add(remote_parent_id);

      const internal_parent_id = await this.resolveParentId(
        remote_parent_id,
        idCache,
        connection.id_connection,
        parentLookupCache,
      );

      if (internal_parent_id) {
        return internal_parent_id;
      }

      try {
        const parentFolder =
          remote_folders.get(remote_parent_id) ||
          (await this.makeRequestWithRetry({
            timeout: 30000,
            method: 'get',
            url: `${connection.account_url}/drive/items/${remote_parent_id}`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          }));

        if (!parentFolder) {
          return null;
        }

        return getInternalParentRecursive(
          parentFolder as SharepointFolderOutput,
          visitedIds,
        );
      } catch (error) {
        this.logger.error(
          `Failed to resolve parent for folder ${folder.id}`,
          error,
        );
        return null;
      }
    };

    await Promise.all(
      pending.map(async (folder) => {
        const internal_parent_id = await getInternalParentRecursive(folder);
        const folder_internal_id = uuidv4();
        idCache.set(folder.id, folder_internal_id);
        output.push({
          ...folder,
          internal_parent_folder_id: internal_parent_id,
          internal_id: folder_internal_id,
        });
      }),
    );
  }

  private async ingestPermissionsForFolders(
    allFolders: SharepointFolderOutput[],
    connection: Connection,
  ): Promise<SharepointFolderOutput[]> {
    const allPermissions: SharepointPermissionOutput[] = [];
    const folderIdToRemotePermissionIdMap: Map<string, string[]> = new Map();
    const batchSize = 4;

    const folders = allFolders.filter((f) => !f.deleted);

    for (let i = 0; i < folders.length; i += batchSize) {
      const batch = folders.slice(i, i + batchSize);
      const permissions = await Promise.all(
        batch.map(async (folder) => {
          const permissionConfig: AxiosRequestConfig = {
            timeout: 30000,
            method: 'get',
            url: `${connection.account_url}/drive/items/${folder.id}/permissions`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          };

          const resp = await this.makeRequestWithRetry(permissionConfig);
          const permissions = resp.data.value;
          folderIdToRemotePermissionIdMap.set(
            folder.id,
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
      `Ingested ${syncedPermissions.length} permissions for folders.`,
    );

    const permissionIdMap: Map<string, string> = new Map(
      syncedPermissions.map((permission) => [
        permission.remote_id,
        permission.id_fs_permission,
      ]),
    );

    folders.forEach((folder) => {
      if (folderIdToRemotePermissionIdMap.has(folder.id)) {
        folder.internal_permissions = folderIdToRemotePermissionIdMap
          .get(folder.id)
          ?.map((permission) => permissionIdMap.get(permission))
          .filter((id) => id !== undefined);
      }
    });

    return allFolders;
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

  async handleDeletedFolder(
    folderId: string,
    connection: Connection,
  ): Promise<void> {
    await this.prisma.fs_folders.update({
      where: {
        id_fs_folder: folderId,
      },
      data: {
        remote_was_deleted: true,
      },
    });
  }

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_folders.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: { sort: 'desc', nulls: 'last' } },
    });
    this.logger.log(`Last sync time: ${lastSync?.remote_modified_at}`);
    return lastSync ? lastSync.remote_modified_at : null;
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

        if (
          (error.response && error.response.status === 429) ||
          (error.response && error.response.status >= 500) ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT' ||
          error.response?.code === 'ETIMEDOUT'
        ) {
          const retryAfter = this.getRetryAfter(
            error.response?.headers['retry-after'],
          );
          const delayTime: number = Math.max(retryAfter * 1000, backoff);

          this.logger.warn(
            `Request failed with ${
              error.code || error.response?.status
            }. Retrying in ${delayTime}ms (Attempt ${attempts}/${
              this.MAX_RETRIES
            })`,
          );

          await this.delay(delayTime);
          backoff *= 2;
          continue;
        }

        this.logger.error(`Request failed: ${error.message}`, error);
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
