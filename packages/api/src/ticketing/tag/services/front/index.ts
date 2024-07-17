import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITagService } from '@ticketing/tag/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
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

  async sync(data: SyncParam): Promise<ApiResponse<FrontTagOutput[]>> {
    try {
      const { linkedUserId, id_ticket } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      /*const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(`${connection.account_url}/conversations`, {
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
      );*/
      const resp = await axios.get(`${connection.account_url}/tags`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data._results,
        message: 'Front tags retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
