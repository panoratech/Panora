import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { IUserService } from '@ticketing/user/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { ZendeskUserOutput } from './types';

@Injectable()
export class ZendeskService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskUserOutput[]>> {
    try {
      const { connection, webhook_remote_identifier } = data;
      const remote_user_id = webhook_remote_identifier as string;
      const request_url = remote_user_id
        ? `${connection.account_url}/v2/users/${remote_user_id}.json`
        : `${connection.account_url}/v2/users.json`;

      const resp = await axios.get(request_url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk users !`);
      const users: ZendeskUserOutput[] = remote_user_id
        ? [resp.data.user]
        : resp.data.users;
      const filteredUsers = users.filter((user) => user.role === 'agent');

      return {
        data: filteredUsers,
        message: 'Zendesk users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
