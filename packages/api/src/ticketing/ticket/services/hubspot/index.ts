import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import {
  HubspotTicketInput,
  HubspotTicketOutput,
  commonHubspotProperties,
} from './types';
import { CommonTicketService } from '@ticketing/@utils/@services/common';

@Injectable()
export class HubspotService
  extends CommonTicketService<HubspotTicketOutput, HubspotTicketInput>
  implements ITicketService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Hubspot', 'hubspot_t');
  }
  async addTicket(
    ticketData: HubspotTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot_t',
        },
      });
      const dataBody = { properties: ticketData };
      const resp = await axios.post(
        `https://api.hubapi.com/crm/v3/objects/tickets`,
        JSON.stringify(dataBody),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data,
        message: 'Hubspot ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }

  protected constructApiEndpoint(custom_properties?: string[]): string {
    const commonPropertyNames = Object.keys(commonHubspotProperties);
    const allProperties = [...commonPropertyNames, ...custom_properties];
    const baseURL = 'https://api.hubapi.com/crm/v3/objects/tickets/';

    const queryString = allProperties
      .map((prop) => `properties=${encodeURIComponent(prop)}`)
      .join('&');

    return `${baseURL}?${queryString}`;
  }

  protected mapResponse(data: any): HubspotTicketOutput[] {
    return data.results;
  }
}
