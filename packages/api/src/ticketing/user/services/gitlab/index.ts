import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GitlabUserOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GitlabService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<GitlabUserOutput[]>> {
    const { linkedUserId } = data;

    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });

      const groups = await axios.get(`${connection.account_url}/v4/groups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      let resp = [];
      for (const group of groups.data) {
        if (group.id) {
          const users = await axios.get(
            `${connection.account_url}/v4/groups/${group.id}/members`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            },
          );
          resp = [...resp, users.data];
        }
      }
      this.logger.log(`Synced gitlab users !`);

      return {
        data: resp.flat(),
        message: 'gitlab users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
