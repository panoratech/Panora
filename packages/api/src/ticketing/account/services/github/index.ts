import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IAccountService } from '@ticketing/account/types';
import { GithubAccountOutput } from './types';

@Injectable()
export class GithubService implements IAccountService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.account.toUpperCase() + ':' + GithubService.name,
    );
    this.registry.registerService('github', this);
  }

  async syncAccounts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<GithubAccountOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
          vertical: 'ticketing'
        },
      });
      const resp = await axios.get(`https://api.github.com/user/orgs`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced github accounts (organizations) !`);

      return {
        data: resp.data,
        message: 'Github accounts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.account,
        ActionType.GET,
      );
    }
  }
}
