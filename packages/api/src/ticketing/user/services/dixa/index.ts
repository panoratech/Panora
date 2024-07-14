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
import { DixaUserOutput } from './types';

@Injectable()
export class DixaService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + DixaService.name,
    );
    this.registry.registerService('dixa', this);
  }

  async syncUsers(
    linkedUserId: string,
    remote_user_id?: string,
  ): Promise<ApiResponse<DixaUserOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dixa',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/endusers/${linkedUserId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced dixa users !`);

      return {
        data: resp.data,
        message: 'dixa users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'dixa',
        TicketingObject.user,
        ActionType.GET,
      );
    }
  }
}
