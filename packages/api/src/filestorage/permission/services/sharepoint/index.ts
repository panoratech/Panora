import { Injectable } from '@nestjs/common';
import { IPermissionService } from '@filestorage/permission/types';
import { FileStorageObject } from '@panora/shared';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SharepointPermissionInput, SharepointPermissionOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class SharepointService implements IPermissionService {
  private readonly MAX_RETRIES: number = 6;
  private readonly INITIAL_BACKOFF_MS: number = 1000;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.permission.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SharepointPermissionOutput[]>> {
    try {
      const { linkedUserId, extra } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      let remote_id;
      if (extra.object_name === 'folder') {
        const folder = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: extra.value,
          },
        });
        remote_id = folder.remote_id;
      } else if (extra.object_name === 'file') {
        const file = await this.prisma.fs_files.findUnique({
          where: {
            id_fs_file: extra.value,
          },
        });
        remote_id = file.remote_id;
      }

      const config: AxiosRequestConfig = {
        method: 'get',
        url: `${connection.account_url}/drive/items/${remote_id}/permissions`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const response = await this.makeRequestWithRetry(config);
      const permissions = response.data.value;

      this.logger.log(
        `Synced ${permissions.length} SharePoint permissions successfully.`,
      );

      return {
        data: permissions,
        message: 'SharePoint permissions retrieved successfully',
        statusCode: 200,
      };
    } catch (error: any) {
      this.logger.error(
        `Error syncing SharePoint permissions: ${error.message}`,
        error,
      );
      throw error;
    }
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
