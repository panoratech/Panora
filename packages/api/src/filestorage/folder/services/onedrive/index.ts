import { Injectable } from '@nestjs/common';
import { IFolderService } from '@filestorage/folder/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { OnedriveFolderInput, OnedriveFolderOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { OnedriveFileOutput } from '@filestorage/file/services/onedrive/types';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from '@@core/connections/@utils/types';
import { fs_folders } from '@prisma/client';
import { OnedrivePermissionOutput } from '@filestorage/permission/services/onedrive/types';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';

@Injectable()
export class OnedriveService implements IFolderService {
  private readonly MAX_RETRIES: number = 5;
  private readonly INITIAL_BACKOFF_MS: number = 1000;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  async addFolder(
    folderData: OnedriveFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<OnedriveFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        throw new Error('OneDrive connection not found.');
      }

      const config: AxiosRequestConfig = {
        timeout: 30000,
        method: 'post',
        url: `${connection.account_url}/v1.0/drive/root/children`,
        data: {
          name: folderData.name,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename', // 'rename' | 'fail' | 'replace'
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const resp: AxiosResponse = await this.makeRequestWithRetry(config);

      return {
        data: resp.data,
        message: 'OneDrive folder created',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error('Error adding folder to OneDrive:', error);
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveFolderOutput[]>> {
    try {
      this.logger.log('Syncing OneDrive folders');
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        throw new Error('OneDrive connection not found.');
      }

      const lastSyncTime = await this.getLastSyncTime(connection.id_connection);

      let folders;

      if (!lastSyncTime) {
        folders = await this.iterativeGetOnedriveFolders(connection);
      } else {
        this.logger.log('Syncing OneDrive folders incrementally');
        folders = await this.incrementalGetOnedriveFolders(
          connection,
          lastSyncTime,
        );
      }

      this.logger.log(`Ingesting permissions for ${folders.length} folders`);

      await this.ingestPermissionsForFolders(folders, connection);

      this.logger.log(
        `${folders.length} OneDrive folders synced successfully.`,
      );

      return {
        data: folders,
        message: 'OneDrive folders synced',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('Error in OneDrive sync:', error);
      console.log(error, 'error in onedrive service');
      throw error;
    }
  }

  async iterativeGetOnedriveFolders(
    connection: Connection,
  ): Promise<OnedriveFolderOutput[]> {
    try {
      const rootConfig: AxiosRequestConfig = {
        method: 'get',
        url: `${connection.account_url}/v1.0/me/drive/root`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const rootFolderData: AxiosResponse = await this.makeRequestWithRetry(
        rootConfig,
      );

      let depth = 0;
      let batch: {
        remote_folder_id: string;
        internal_id: string | null;
        internal_parent_folder_id: string | null;
      }[] = [
        {
          remote_folder_id: rootFolderData.data.id,
          internal_id: uuidv4(),
          internal_parent_folder_id: null,
        },
      ];

      let result: OnedriveFolderOutput[] = [
        {
          ...rootFolderData.data,
          remote_folder_id: batch[0].remote_folder_id,
          internal_id: batch[0].internal_id,
          internal_parent_folder_id: batch[0].internal_parent_folder_id,
        },
      ];

      while (batch.length > 0) {
        if (depth > 50) {
          this.logger.warn('Maximum folder depth reached.');
          break;
        }

        const nestedFoldersPromises: Promise<OnedriveFolderOutput[]>[] =
          batch.map(
            async (folder: {
              remote_folder_id: string;
              internal_id: string;
              internal_parent_folder_id: string;
            }) => {
              try {
                const childrenConfig: AxiosRequestConfig = {
                  timeout: 30000,
                  method: 'get',
                  url: `${connection.account_url}/v1.0/me/drive/items/${folder.remote_folder_id}/children`,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                      connection.access_token,
                    )}`,
                  },
                };

                const resp: AxiosResponse = await this.makeRequestWithRetry(
                  childrenConfig,
                );

                const folders: OnedriveFolderOutput[] = resp.data.value.filter(
                  (driveItem: any) => driveItem.folder,
                );

                return folders.map((f: OnedriveFolderOutput) => ({
                  ...f,
                  internal_id: uuidv4(),
                  internal_parent_folder_id: folder.internal_id,
                }));
              } catch (error: any) {
                if (error.response && error.response.status === 404) {
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

        const nestedFolders: OnedriveFolderOutput[][] = await Promise.all(
          nestedFoldersPromises,
        );

        result = result.concat(nestedFolders.flat());
        batch = nestedFolders.flat().map((folder: OnedriveFolderOutput) => ({
          remote_folder_id: folder.id,
          internal_id: folder.internal_id,
          internal_parent_folder_id: folder.internal_parent_folder_id,
        }));
        this.logger.log(`Batch size: ${batch.length} at depth ${depth}`);
        depth++;
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching OneDrive folders:', error);
      throw error;
    }
  }

  async incrementalGetOnedriveFolders(
    connection: Connection,
    lastSyncTime: Date,
  ): Promise<OnedriveFolderOutput[]> {
    // ref: https://learn.microsoft.com/en-us/graph/api/driveitem-delta?view=graph-rest-1.0&tabs=http#example-4-retrieving-delta-results-using-a-timestamp
    let deltaLink = `${
      connection.account_url
    }/v1.0/me/drive/root/delta?token=${lastSyncTime.toISOString()}`;

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

    const onedriveFolders: OnedriveFolderOutput[] = [];

    do {
      const deltaResponse = await this.makeRequestWithRetry(deltaConfig);
      if (!deltaResponse.data.value) {
        break;
      }
      deltaLink = deltaResponse.data.deltaLink;
      onedriveFolders.push(
        ...deltaResponse.data.value.filter((f: any) => f.folder),
      );
    } while (deltaLink);

    // Sort folders by lastModifiedDateTime in descending order (newest first)
    const sortedFolders = [...onedriveFolders].sort((a, b) => {
      const dateA = new Date(a.lastModifiedDateTime).getTime();
      const dateB = new Date(b.lastModifiedDateTime).getTime();
      return dateB - dateA;
    });

    const uniqueFolders = sortedFolders.reduce((acc, folder) => {
      if (!acc.has(folder.id)) {
        acc.set(folder.id, folder);
      }
      return acc;
    }, new Map<string, OnedriveFolderOutput>());

    const deletedFolders = Array.from(uniqueFolders.values()).filter(
      (f: any) => f.deleted,
    );

    const updatedFolders = Array.from(uniqueFolders.values()).filter(
      (f: any) => !f.deleted,
    );

    // handle updated folders
    const foldersToSync = await this.assignParentIds(
      updatedFolders,
      connection,
    );

    return [...foldersToSync, ...deletedFolders];
  }

  /**
   * Ingests and assigns permissions for folders.
   * @param allFolders - Array of OneDriveFolderOutput to process.
   * @param connection - The connection object.
   * @returns The updated array of OneDriveFolderOutput with ingested permissions.
   */
  private async ingestPermissionsForFolders(
    allFolders: OnedriveFolderOutput[],
    connection: Connection,
  ): Promise<OnedriveFolderOutput[]> {
    const allPermissions: OnedrivePermissionOutput[] = [];
    const folderIdToRemotePermissionIdMap: Map<string, string[]> = new Map();
    const batchSize = 4; // simultaneous requests

    const folders = allFolders.filter((f) => !f.deleted);

    for (let i = 0; i < folders.length; i += batchSize) {
      const batch = folders.slice(i, i + batchSize);
      const permissions = await Promise.all(
        batch.map(async (folder) => {
          const permissionConfig: AxiosRequestConfig = {
            timeout: 30000,
            method: 'get',
            url: `${connection.account_url}/v1.0/me/drive/items/${folder.id}/permissions`,
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
      OnedrivePermissionOutput
    >(
      uniquePermissions,
      'onedrive',
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
    permissions: OnedrivePermissionOutput[],
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

  /**
   * Assigns internal parent IDs to OneDrive folders, ensuring proper parent-child relationships.
   * @param folders - Array of OneDriveFolderOutput to process.
   * @returns The updated array of OneDriveFolderOutput with assigned internal parent IDs.
   */
  private async assignParentIds(
    folders: OnedriveFolderOutput[],
    connection: Connection,
  ): Promise<OnedriveFolderOutput[]> {
    const folderIdToInternalIdMap: Map<string, string> = new Map();
    const foldersToSync: OnedriveFolderOutput[] = [];
    let remainingFolders: OnedriveFolderOutput[] = [...folders];
    const parentLookupCache: Map<string, string | null> = new Map();

    while (remainingFolders.length > 0) {
      const foldersStillPending: OnedriveFolderOutput[] = [];

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
  ) {
    const folder = await this.prisma.fs_folders.findFirst({
      where: { remote_id: folderId, id_connection: connection.id_connection },
      select: { id_fs_folder: true },
    });
    return folder?.id_fs_folder || uuidv4();
  }

  /**
   * Resolves the internal parent ID for a given remote parent ID.
   * @param parentId - The remote parent folder ID.
   * @param idMap - Map of remote IDs to internal IDs.
   * @param connectionId - The connection ID.
   * @param cache - Cache for parent ID lookups.
   * @returns The internal parent ID or null if not found.
   */
  private async resolveParentId(
    parentId: string,
    idMap: Map<string, string>,
    connectionId: string,
    cache: Map<string, string | null>,
  ): Promise<string | null | undefined> {
    if (idMap.has(parentId)) {
      return idMap.get(parentId);
    }

    if (parentId === 'root') {
      return 'root';
    }

    if (cache.has(parentId)) {
      return cache.get(parentId);
    }

    const parentFolder = await this.prisma.fs_folders.findFirst({
      where: {
        remote_id: parentId,
        id_connection: connectionId,
      },
      select: { id_fs_folder: true },
    });

    const result = parentFolder?.id_fs_folder || null;
    cache.set(parentId, result);
    return result;
  }

  /**
   * Handles folders that couldn't be resolved in the initial pass.
   * @param pending - Folders still pending resolution.
   * @param output - Already processed folders.
   * @param idMap - Map of remote IDs to internal IDs.
   * @param cache - Cache for parent ID lookups.
   */
  private async handleUnresolvedFolders(
    pending: OnedriveFolderOutput[],
    output: OnedriveFolderOutput[],
    remote_folders: Map<string, OnedriveFolderOutput>,
    parentLookupCache: Map<string, string | null>,
    idCache: Map<string, string | null>,
    connection: Connection,
  ): Promise<void> {
    this.logger.warn(
      `${pending.length} folders could not be resolved in the initial pass. Attempting to resolve remaining folders.`,
    );

    const getInternalParentRecursive = async (
      folder: OnedriveFolderOutput,
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

      // Try to get parent from remote folders map or API
      try {
        const parentFolder =
          remote_folders.get(remote_parent_id) ||
          (await this.makeRequestWithRetry({
            timeout: 30000,
            method: 'get',
            url: `${connection.account_url}/v1.0/me/drive/items/${remote_parent_id}`,
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
          parentFolder as OnedriveFolderOutput,
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

  /**
   * Handles the deletion of a folder by marking it and its children as deleted in the database.
   * @param folderId - The internal ID of the folder to be marked as deleted.
   * @param connection - The connection object containing the connection details.
   */
  async handleDeletedFolder(folderId: string, connection: Connection) {
    const folder = await this.prisma.fs_folders.findFirst({
      where: {
        id_fs_folder: folderId,
        id_connection: connection.id_connection,
      },
      select: {
        remote_was_deleted: true,
        id_fs_folder: true,
        parent_folder: true,
      },
    });

    if (!folder || folder.remote_was_deleted) {
      return;
    }

    // update the folder to be deleted
    await this.prisma.fs_folders.update({
      where: {
        id_fs_folder: folderId,
      },
      data: {
        remote_was_deleted: true,
      },
    });
  }

  /**
   * Checks if a folder is deleted on the remote OneDrive service.
   * @param folder - The folder to check.
   * @param connection - The connection object containing the connection details.
   * @returns True if the folder is deleted, false otherwise.
   */
  private async folderDeletedOnRemote(
    folder: fs_folders,
    connection: Connection,
  ) {
    try {
      const remoteFolder = await this.makeRequestWithRetry({
        timeout: 30000,
        method: 'get',
        url: `${connection.account_url}/v1.0/me/drive/items/${folder.remote_id}?$select=id,deleted`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return remoteFolder && remoteFolder.data.deleted;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // If we get a 404, we assume the folder is deleted
        return true;
      }
      throw error;
    }
  }

  /**
   * Gets the last sync time for a connection.
   * @param connectionId - The ID of the connection.
   * @returns The last sync time or null if no sync time is found.
   */
  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_folders.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: { sort: 'desc', nulls: 'last' } },
    });
    this.logger.log(
      `Last sync time for connection ${connectionId} one drive folders: ${lastSync?.remote_modified_at}`,
    );
    return lastSync ? lastSync.remote_modified_at : null;
  }

  /**
   * Makes an HTTP request with rate limit handling using exponential backoff.
   * @param config - Axios request configuration.
   * @returns Axios response.
   */
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
      'onedrive',
      'makeRequestWithRetry',
    );
    throw new Error('Max retry attempts reached.');
  }

  /**
   * Parses the Retry-After header to determine the wait time.
   * @param retryAfterHeader - Value of the Retry-After header.
   * @returns Retry delay in seconds.
   */
  private getRetryAfter(retryAfterHeader: string | undefined): number {
    if (!retryAfterHeader) {
      return 1; // Default to 1 second if header is missing
    }

    const retryAfterSeconds: number = parseInt(retryAfterHeader, 10);
    return isNaN(retryAfterSeconds) ? 1 : retryAfterSeconds + 0.5;
  }

  /**
   * Delays execution for the specified duration.
   * @param ms - Duration in milliseconds.
   * @returns Promise that resolves after the delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
