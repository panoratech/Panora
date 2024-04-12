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

@Injectable()
export class HubspotService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot_t', this);
  }
  async addTicket(
    ticketData: HubspotTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'ticketing',
        },
      });
      const dataBody = { properties: ticketData };
      const resp = await axios.post(
        `${connection.account_url}/objects/tickets`,
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
  async syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'ticketing',
        },
      });

      const commonPropertyNames = Object.keys(commonHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = '${connection.account_url}/objects/tickets/';

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;
      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot tickets !`);

      return {
        data: resp.data.results,
        message: 'Hubspot tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
