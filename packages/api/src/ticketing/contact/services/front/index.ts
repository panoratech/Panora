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
import { FrontContactOutput } from './types';

@Injectable()
export class FrontService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async syncContacts(
    linkedUserId: string,
    unused_,
    remote_account_id: string,
  ): Promise<ApiResponse<FrontContactOutput[]>> {
    try {
      if (!remote_account_id) throw new Error('remote account id not found');

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing'
        },
      });

      const resp = await axios.get(
        `https://api2.frontapp.com/accounts/${remote_account_id}/contacts`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced front contacts !`);

      return {
        data: resp.data._results,
        message: 'Front contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.contact,
        ActionType.GET,
      );
    }
  }
}
