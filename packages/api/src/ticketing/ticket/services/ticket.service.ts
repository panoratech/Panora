import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './zendesk';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTicketInput } from '../types/model.unified';
import { TicketResponse } from '../types';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private zendesk: ZendeskService,
    private logger: LoggerService,
    private webhook: WebhookService,
  ) {
    this.logger.setContext(TicketService.name);
  }

  async batchAddTickets(
    unifiedTicketData: UnifiedTicketInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    return;
  }

  async addTicket(
    unifiedTicketData: UnifiedTicketInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    return;
  }

  async getTicket(
    id_ticketing_ticket: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    return;
  }

  async getTickets(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    return;
  }
  //TODO
  async updateTicket(
    id: string,
    updateTicketData: Partial<UnifiedTicketInput>,
  ): Promise<ApiResponse<TicketResponse>> {
    try {
    } catch (error) {
      handleServiceError(error, this.logger);
    }
    // TODO: fetch the ticket from the database using 'id'
    // TODO: update the ticket with 'updateTicketData'
    // TODO: save the updated ticket back to the database
    // TODO: return the updated ticket
    return;
  }
}
