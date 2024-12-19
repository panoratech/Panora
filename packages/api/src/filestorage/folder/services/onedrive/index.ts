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

      const folders: OnedriveFolderOutput[] =
        await this.iterativeGetOnedriveFolders('root', linkedUserId);

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
      throw error;
    }
  }

  async iterativeGetOnedriveFolders(
    remote_folder_id: string,
    linkedUserId: string,
  ): Promise<OnedriveFolderOutput[]> {
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

      let result: OnedriveFolderOutput[] = [rootFolderData.data];
      let depth = 0;
      let batch: {
        remote_folder_id: string;
        internal_id: string | null;
        internal_parent_folder_id: string | null;
      }[] = [
        {
          remote_folder_id: remote_folder_id,
          internal_id: uuidv4(),
          internal_parent_folder_id: null,
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
                  console.log('Found deleted folder');
                  const f = await this.prisma.fs_folders.findFirst({
                    where: {
                      remote_id: folder.remote_folder_id,
                      id_connection: connection.id_connection,
                    },
                    select: {
                      id_fs_folder: true,
                    },
                  });
                  if (f) {
                    await this.handleDeletedFolder(f.id_fs_folder, connection);
                  }
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
      this.logger.debug('Folder already marked deleted');
      return;
    }

    const highestDeletedPredecessor = await this.findHigestDeletedPredecessor(
      folder as fs_folders,
      connection,
    );

    if (highestDeletedPredecessor === 'not_deleted') {
      this.logger.debug(
        "Higest deleted predecessor came out to be as 'not_deleted'",
      );
      return;
    }

    const entitiesDeleted = await this.markChildrenAsDeleted(
      highestDeletedPredecessor,
      connection,
    );

    this.logger.debug(
      `Deleted ${entitiesDeleted} entities for folder ${folderId}`,
    );
  }

  private async markChildrenAsDeleted(
    folderId: string,
    connection: Connection,
  ): Promise<number> {
    let entitiesDeleted = 0;

    // we need to find all the children of this folder and mark them as deleted
    const childFolders = await this.prisma.fs_folders.findMany({
      where: {
        parent_folder: folderId,
        id_connection: connection.id_connection,
      },
      select: {
        id_fs_folder: true,
        remote_was_deleted: false,
      },
    });

    const childFiles = await this.prisma.fs_files.findMany({
      where: {
        id_fs_folder: folderId,
        id_connection: connection.id_connection,
      },
      select: {
        id_fs_file: true,
        remote_was_deleted: false,
      },
    });

    const childFolderIds = childFolders.map((f) => f.id_fs_folder);
    const childFileIds = childFiles.map((f) => f.id_fs_file);

    await this.prisma.fs_folders.updateMany({
      where: {
        id_fs_folder: { in: childFolderIds },
      },
      data: {
        remote_was_deleted: true,
      },
    });

    await this.prisma.fs_files.updateMany({
      where: {
        id_fs_file: { in: childFileIds },
      },
      data: {
        remote_was_deleted: true,
      },
    });

    entitiesDeleted += childFolderIds.length + childFileIds.length;

    const childFolderResults = await Promise.all(
      childFolderIds.map(
        async (id) => await this.markChildrenAsDeleted(id, connection),
      ),
    );

    entitiesDeleted += childFolderResults.reduce((acc, curr) => acc + curr, 0);
    return entitiesDeleted;
  }

  private async findHigestDeletedPredecessor(
    folder: fs_folders,
    connection: Connection,
  ): Promise<string | 'not_deleted'> {
    // if the folder has no parent, it is the root folder
    if (!folder.parent_folder) {
      return folder.id_fs_folder;
    }

    const remoteDeleted = folder.remote_was_deleted
      ? true
      : await this.folderDeletedOnRemote(folder, connection);
    if (!remoteDeleted) {
      return 'not_deleted';
    }

    // if the folder is deleted, we need to find the highest deleted predecessor
    const parentFolder = await this.prisma.fs_folders.findFirst({
      where: {
        id_fs_folder: folder.parent_folder,
        id_connection: connection.id_connection,
      },
      select: {
        remote_was_deleted: true,
        id_fs_folder: true,
        parent_folder: true,
      },
    });

    if (!parentFolder) {
      return folder.id_fs_folder;
    }

    const parentResult = await this.findHigestDeletedPredecessor(
      parentFolder as fs_folders,
      connection,
    );

    if (parentResult === 'not_deleted') {
      return folder.id_fs_folder;
    }

    return parentResult;
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
