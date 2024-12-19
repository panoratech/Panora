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
import { OnedriveFileOutput } from './types';
import { OnedriveService as OnedriveFolderService } from '@filestorage/folder/services/onedrive';
@Injectable()
export class OnedriveService implements IFileService {
  private readonly MAX_RETRIES: number = 5;
  private readonly INITIAL_BACKOFF_MS: number = 1000;
  private readonly BATCH_SIZE: number = 20;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private onedriveFolderService: OnedriveFolderService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  // todo: add addFile method

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      const foldersToSync = ['root'];
      if (id_folder) {
        const folder = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: id_folder as string,
          },
        });
        if (folder && folder.remote_id !== 'root') {
          foldersToSync.push(folder.remote_id);
        }
      } else {
        const folders = await this.prisma.fs_folders.findMany({
          where: {
            id_connection: connection.id_connection,
            remote_was_deleted: false,
          },
          select: {
            remote_id: true,
          },
        });
        foldersToSync.push(...folders.map((folder) => folder.remote_id));
      }

      const allFiles: OnedriveFileOutput[] = [];

      // Process folders in batches
      for (let i = 0; i < foldersToSync.length; i += this.BATCH_SIZE) {
        const batch = foldersToSync.slice(i, i + this.BATCH_SIZE);

        // Synchronize all folders in the current batch concurrently
        const filePromises = batch.map(async (folderId) => {
          const files = await this.syncFolder(connection, folderId);
          return files;
        });

        // Await all promises for the current batch
        const batchFiles = await Promise.all(filePromises);
        const flatBatchFiles = batchFiles.flat();
        allFiles.push(...flatBatchFiles);

        this.logger.log(
          `Batch ${i / this.BATCH_SIZE + 1} completed: got ${
            flatBatchFiles.length
          } files.`,
        );
      }

      this.logger.log(`Synced ${allFiles.length} files for onedrive.`);
      return {
        data: allFiles,
        message: "OneDrive's files retrieved from root and specified folder",
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Error syncing OneDrive files: ${error.message}`,
        error,
      );
      throw error;
    }
  }
  private async syncFolder(
    connection: any,
    folderId: string,
  ): Promise<OnedriveFileOutput[]> {
    try {
      const config: AxiosRequestConfig = {
        timeout: 30000,
        method: 'get',
        url: `${connection.account_url}/v1.0/me/drive/items/${folderId}/children`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const resp: AxiosResponse = await this.makeRequestWithRetry(config);

      const files: OnedriveFileOutput[] = resp.data.value.filter(
        (elem: any) => !elem.folder, // files don't have a folder property
      );

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
        if (internalFolder && internalFolder.remote_was_deleted) {
          this.logger.debug(
            `Folder ${internalFolder.id_fs_folder} not found in OneDrive, marking as deleted in internal database.`,
          );
          await this.onedriveFolderService.handleDeletedFolder(
            internalFolder.id_fs_folder,
            connection,
          );
        }
        return [];
      }
      throw error;
    }

    // Add permissions (shared link is also included in permissions in OneDrive)
    // await Promise.all(
    //   files.map(async (driveItem: OnedriveFileOutput) => {
    //     const permissionsConfig: AxiosRequestConfig = {
    //       method: 'get',
    //       url: `${connection.account_url}/v1.0/me/drive/items/${driveItem.id}/permissions`,
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${this.cryptoService.decrypt(
    //           connection.access_token,
    //         )}`,
    //       },
    //     };

    //     const permissionsResp: AxiosResponse = await this.makeRequestWithRetry(
    //       permissionsConfig,
    //     );
    //     driveItem.permissions = permissionsResp.data.value;
    //   }),
    // );
  }

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${connection.account_url}/v1.0/me/drive/items/${fileId}/content`,
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
    return isNaN(retryAfterSeconds) ? 1 : retryAfterSeconds;
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
