import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IContactService } from '@ticketing/contact/types';
import { GorgiasContactOutput } from './types';

@Injectable()
export class GorgiasService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + GorgiasService.name,
    );
    this.registry.registerService('gorgias', this);
  }

  async syncContacts(
    linkedUserId: string,
    unused_,
    remote_account_id: string,
  ): Promise<ApiResponse<GorgiasContactOutput[]>> {
    try {
      if (!remote_account_id) throw new Error('remote account id not found');

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing'
        },
      });

      const resp = await axios.get(`${connection.account_url}/api/customers`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced gorgias contacts !`);

      return {
        data: resp.data._results,
        message: 'Gorgias contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gorgias',
        TicketingObject.contact,
        ActionType.GET,
      );
    }
  }
}
