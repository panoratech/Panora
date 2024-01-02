import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../registry.service';
import { FrontTicketInput, FrontTicketOutput } from './types';

@Injectable()
export class FrontService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }
  async addTicket(
    ticketData: FrontTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FrontTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
        },
      });
      const dataBody = ticketData;
      const resp = await axios.post(
        `https://api2.frontapp.com/conversations`,
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
        message: 'Front ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }
  async syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
        },
      });

      const resp = await axios.get('https://api2.frontapp.com/conversations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced front tickets !`);

      return {
        data: resp.data._results,
        message: 'Front tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
