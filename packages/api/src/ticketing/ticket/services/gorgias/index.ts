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
import { GorgiasTicketInput, GorgiasTicketOutput } from './types';
import * as fs from 'fs';

@Injectable()
export class GorgiasService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + GorgiasService.name,
    );
    this.registry.registerService('gorgias', this);
  }

  async addTicket(
    ticketData: GorgiasTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GorgiasTicketOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing',
        },
      });

      const comments = ticketData.messages;
      const modifiedComments = await Promise.all(
        comments.map(async (comment) => {
          let uploads = [];
          const uuids = comment.attachments as any[];
          if (uuids && uuids.length > 0) {
            const attachmentPromises = uuids.map(async (uuid) => {
              const res = await this.prisma.tcg_attachments.findUnique({
                where: {
                  id_tcg_attachment: uuid.extra,
                },
              });
              if (!res) {
                throw new Error(`tcg_attachment not found for uuid ${uuid}`);
              }
              // Assuming you want to construct the right binary attachment here
              // For now, we'll just return the URL
              const stats = fs.statSync(res.file_url);
              return {
                url: res.file_url,
                name: res.file_name,
                size: stats.size,
                content_type: 'application/pdf', //todo
              };
            });
            uploads = await Promise.all(attachmentPromises);
          }

          // Assuming you want to modify the comment object here
          // For now, we'll just add the uploads to the comment
          return {
            ...comment,
            attachments: uploads,
          };
        }),
      );

      const resp = await axios.post(
        `${connection.account_url}/tickets`,
        JSON.stringify({ ...ticketData, messages: modifiedComments }),
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
        message: 'Gorgias ticket created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gorgias',
        TicketingObject.ticket,
        ActionType.POST,
      );
    }
  }

  async syncTickets(
    linkedUserId: string,
  ): Promise<ApiResponse<GorgiasTicketOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}s/tickets`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced gorgias tickets !`);

      return {
        data: resp.data,
        message: 'Gorgias tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gorgias',
        TicketingObject.ticket,
        ActionType.GET,
      );
    }
  }
}
