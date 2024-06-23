import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { dixaTicketInput, dixaTicketOutput } from './types';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class dixa implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + dixa.name,
    );
    this.registry.registerService('dixa', this);
  }

  async addTicket(
    ticketData: dixaTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<dixaTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dixa',
          vertical: 'ticketing',
        },
      });

      //Add comment by calling the unified comment function but first insert the ticket base data

      const resp = await axios.post(
        `${connection.account_url}/conversations`,
        JSON.stringify(ticketData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // Add comment if someone wants to add one when creation of the ticket

      return {
        data: resp.data,
        message: 'dixa ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'dixa',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }

  async syncTickets(
    linkedUserId: string,
    remote_ticket_id?: string,
  ): Promise<ApiResponse<dixaTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dixa',
          vertical: 'ticketing',
        },
      });
      const resp = await axios.get(
        `${connection.account_url}/conversations/${remote_ticket_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced dixa tickets !`);

      return {
        data: resp.data,
        message: 'dixa tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'dixa',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}