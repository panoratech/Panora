import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { IContactService } from '@ticketing/contact/types';
import { DixaContactOutput } from './types';

@Injectable()
export class DixaService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + DixaService.name,
    );
    this.registry.registerService('Dixa', this);
  }

  async syncContacts(
    linkedUserId: string,
    remote_account_id: string,
  ): Promise<ApiResponse<DixaContactOutput[]>> {
    try {
      if (!remote_account_id)
        throw new ReferenceError('remote account id not found');

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'Dixa',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/beta/contact-endpoints/${remote_account_id}`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced Dixa contacts !`);

      return {
        data: resp.data,
        message: 'Dixa contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
      /*handle3rdPartyServiceError(
        error,
        this.logger,
        'Dixa',
        TicketingObject.contact,
        ActionType.GET,
      );*/
    }
  }
}
