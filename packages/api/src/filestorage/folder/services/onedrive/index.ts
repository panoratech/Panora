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
      let batch: string[] = [remote_folder_id];

      while (batch.length > 0) {
        if (depth > 5) {
          this.logger.warn('Maximum folder depth reached.');
          break;
        }

        const nestedFoldersPromises: Promise<OnedriveFolderOutput[]>[] =
          batch.map(async (folder_id: string) => {
            const childrenConfig: AxiosRequestConfig = {
              method: 'get',
              url: `${connection.account_url}/v1.0/me/drive/items/${folder_id}/children`,
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

            return folders;
          });

        const nestedFolders: OnedriveFolderOutput[][] = await Promise.all(
          nestedFoldersPromises,
        );

        result = result.concat(nestedFolders.flat());
        batch = nestedFolders
          .flat()
          .map((folder: OnedriveFolderOutput) => folder.id);
        this.logger.log(`Batch size: ${batch.length} at depth ${depth}`);
        depth++;
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching OneDrive folders:', error);
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveFolderOutput[]>> {
    try {
      this.logger.log('Syncing OneDrive folders');
      const { linkedUserId } = data;

      const folders: OnedriveFolderOutput[] =
        await this.iterativeGetOnedriveFolders('root', linkedUserId);

      this.logger.log(`${folders.length} OneDrive folders found`);
      this.logger.log('OneDrive folders synced successfully.');

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
        if (error.response && error.response.status === 429) {
          attempts++;
          const retryAfter: number = this.getRetryAfter(
            error.response.headers['retry-after'],
          );
          const delay: number = Math.max(retryAfter * 1000, backoff);

          this.logger.warn(
            `Rate limit hit. Retrying request in ${delay}ms (Attempt ${attempts}/${this.MAX_RETRIES})`,
          );

          await this.delay(delay);
          backoff *= 2; // Exponential backoff
        } else {
          this.logger.error('HTTP request failed:', error);
          throw error;
        }
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
