import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITagService } from '@ticketing/tag/types';
import { FrontTagOutput } from './types';

@Injectable()
export class FrontService implements ITagService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.tag.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async syncTags(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<FrontTagOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket,
        },
        select: {
          remote_id: true,
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
      this.logger.log(`Synced front tags !`);

      const conversation = resp.data._results.find(
        (c) => c.id === ticket.remote_id,
      );

      return {
        data: conversation.tags,
        message: 'Front tags retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.tag,
        ActionType.GET,
      );
    }
  }
}
