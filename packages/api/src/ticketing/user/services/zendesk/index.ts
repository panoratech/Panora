import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
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

  async syncUsers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskUserOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced zendesk users !`);
      const users: ZendeskUserOutput[] = resp.data.users;
      const filteredUsers = users.filter(
        (user) => user.role === 'agent' || user.role === 'admin',
      );

      return {
        data: filteredUsers,
        message: 'Zendesk users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }

  async syncUser(
    linkedUserId: string,
    remote_id: string,
  ): Promise<ApiResponse<any[]>> {
    return {
      data: [],
      message: 'Default syncUser implementation',
      statusCode: 200,
    };
  }
}
