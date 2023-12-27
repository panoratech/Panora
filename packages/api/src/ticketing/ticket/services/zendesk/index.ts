import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalTicketOutput } from '@@core/utils/types/original.output';

@Injectable()
export class ZendeskService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + ZendeskService.name,
    );
  }
  addTicket(
    ticketData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTicketOutput>> {
    throw new Error('Method not implemented.');
  }
  syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTicketOutput[]>> {
    throw new Error('Method not implemented.');
  }
}
