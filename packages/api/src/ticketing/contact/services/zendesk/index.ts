import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  TicketingObject,
  ZendeskContactOutput,
} from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IContactService } from '@ticketing/contact/types';

@Injectable()
export class ZendeskService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk_t', this);
  }

  async syncContacts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskContactOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
        },
      });

      const resp = await axios.get(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/contacts`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zendesk contacts !`);

      return {
        data: resp.data.contacts,
        message: 'Zendesk contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.contact,
        ActionType.GET,
      );
    }
  }
}
