import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { FrontUserOutput } from './types';

@Injectable()
export class FrontService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async syncUsers(
    linkedUserId: string,
  ): Promise<ApiResponse<FrontUserOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/teammates`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced front users !`);

      return {
        data: resp.data._results,
        message: 'Front users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'front',
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }
}
