import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { JiraTicketInput, JiraTicketOutput } from './types';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class JiraService implements ITicketService {
  private readonly utils: Utils;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
    this.utils = new Utils();
  }

  async addTicket(
    ticketData: JiraTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<JiraTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });

      //Add comment by calling the unified comment function but first insert the ticket base data

      const resp = await axios.post(
        `${connection.account_url}/rest/api/v2/issue`,
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
        message: 'Jira ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Jira',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  async syncTickets(
    linkedUserId: string,
  ): Promise<ApiResponse<JiraTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });
      const resp = await axios.get(`${connection.account_url}/search`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced jira tickets !`);

      return {
        data: resp.data?.issues,
        message: 'Jira tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Jira',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
