import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GithubUserOutput } from './types';

//TODO
@Injectable()
export class GithubService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + GithubService.name,
    );
    this.registry.registerService('github', this);
  }

  async syncUsers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<GithubUserOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
          vertical: 'ticketing'
        },
      });
      const resp = await axios.get(`https://api.github.com/user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced github users !`);

      return {
        data: resp.data,
        message: 'Github users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }
}
