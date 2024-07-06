import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { JiraTicketInput, JiraTicketOutput } from './types';

@Injectable()
export class JiraService implements ITicketService {
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
        `${connection.account_url}/issue`,
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
      handle3rdPartyServiceError(
        error,
        this.logger,
        'jira',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<JiraTicketOutput[]>> {
    try {
      const { linkedUserId } = data;

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
        data: resp.data.issues,
        message: 'Jira tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'jira',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
