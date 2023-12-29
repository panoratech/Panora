import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject, ZendeskTicketOutput } from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class ZendeskService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + ZendeskService.name,
    );
  }
  async addTicket(
    ticketData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTicketOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
        },
      });
      const dataBody = {
        ticket: ticketData,
      };
      const resp = await axios.post(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets.json`,
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
        message: 'Zendesk ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTicketOutput[]>> {
    throw new Error('Method not implemented.');
  }
}
