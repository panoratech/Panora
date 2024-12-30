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
import { SharepointGroupOutput } from './types';
import { connections } from '@prisma/client';

@Injectable()
export class SharepointService implements IGroupService {
  private readonly MAX_RETRIES: number = 6;
  private readonly INITIAL_BACKOFF_MS: number = 1000;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.group.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<SharepointGroupOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      // remove /sites/site_id from account_url for accessing groups endpoint
      const url = connection.account_url.replace(/\/sites\/.+$/, '');

      const config: AxiosRequestConfig = {
        method: 'get',
        url: `${url}/groups`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      };

      const resp: AxiosResponse = await this.makeRequestWithRetry(config);
      const groups: SharepointGroupOutput[] = resp.data.value;
      await this.assignUsersForGroups(groups, connection);

      this.logger.log(
        `Synced ${groups.length} SharePoint groups successfully.`,
      );

      return {
        data: groups,
        message: 'SharePoint groups retrieved successfully',
        statusCode: 200,
      };
    } catch (error: any) {
      this.logger.error(
        `Error syncing SharePoint groups: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private async assignUsersForGroups(
    groups: SharepointGroupOutput[],
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
    group: SharepointGroupOutput,
    connection: connections,
  ) {
    const url = connection.account_url.replace(/\/sites\/.+$/, '');
    const config: AxiosRequestConfig = {
      timeout: 10000,
      method: 'get',
      url: `${url}/groups/${group.id}/members`,
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
