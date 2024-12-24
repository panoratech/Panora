import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IGroupService } from '@filestorage/group/types';
import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServiceRegistry } from '../registry.service';
import { OnedriveGroupOutput } from './types';
import { connections } from '@prisma/client';

@Injectable()
export class OnedriveService implements IGroupService {
  private readonly MAX_RETRIES: number = 6;
  private readonly INITIAL_BACKOFF_MS: number = 1000;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.group.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  /**
   * Synchronizes OneDrive groups.
   * @param data - Synchronization parameters.
   * @returns API response with an array of OneDrive group outputs.
   */
  async sync(data: SyncParam): Promise<ApiResponse<OnedriveGroupOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      const config: AxiosRequestConfig = {
        method: 'get',
        url: `${connection.account_url}/v1.0/groups`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const resp: AxiosResponse = await this.makeRequestWithRetry(config);

      const groups: OnedriveGroupOutput[] = resp.data.value;
      await this.assignUsersForGroups(groups, connection);
      this.logger.log(`Synced ${groups.length} OneDrive groups successfully.`);

      return {
        data: groups,
        message: 'OneDrive groups retrieved successfully.',
        statusCode: 200,
      };
    } catch (error: any) {
      this.logger.error(
        `Error syncing OneDrive groups: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private async assignUsersForGroups(
    groups: OnedriveGroupOutput[],
    connection: connections,
  ) {
    const userLookupCache: Map<string, string> = new Map();

    for (const group of groups) {
      const users = await this.fetchUsersForGroup(group, connection);
      const internalUsers = await Promise.all(
        users.map(async (user) => {
          if (userLookupCache.has(user.id)) {
            return userLookupCache.get(user.id);
          }
          const internalUser = await this.prisma.fs_users.findFirst({
            where: {
              remote_id: user.id,
            },
            select: {
              id_fs_user: true,
            },
          });
          userLookupCache.set(user.id, internalUser?.id_fs_user || null);
          return internalUser?.id_fs_user || null;
        }),
      );
      group.internal_users = internalUsers.filter(
        (user) => user !== null,
      ) as string[];
    }
  }

  private async fetchUsersForGroup(
    group: OnedriveGroupOutput,
    connection: connections,
  ) {
    const config: AxiosRequestConfig = {
      timeout: 10000,
      method: 'get',
      url: `${connection.account_url}/v1.0/groups/${group.id}/members`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`,
      },
    };

    const resp: AxiosResponse = await this.makeRequestWithRetry(config);

    return resp.data.value;
  }

  /**
   * Makes an HTTP request with retry logic for handling 500 and 429 errors.
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

        // Handle rate limiting (429) and server errors (500+)
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
          backoff *= 2; // Exponential backoff
          continue;
        }

        // Handle other errors
        this.logger.error(`Request failed: ${error.message}`, error);
        throw error;
      }
    }

    this.logger.error(
      'Max retry attempts reached. Request failed.',
      OnedriveService.name,
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
