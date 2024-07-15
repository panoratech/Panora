import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { GorgiasTicketInput, GorgiasTicketOutput } from './types';
import * as fs from 'fs';
import { SyncParam } from '@@core/utils/types/interface';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GorgiasService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
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
          const uuids = comment.attachments as string[];
          if (uuids && uuids.length > 0) {
            const attachmentPromises = uuids.map(async (uuid) => {
              const res = await this.prisma.tcg_attachments.findUnique({
                where: {
                  id_tcg_attachment: uuid,
                },
              });
              if (!res) {
                throw new ReferenceError(
                  `tcg_attachment not found for uuid ${uuid}`,
                );
              }
              // Assuming you want to construct the right binary attachment here
              // For now, we'll just return the URL
              const stats = fs.statSync(res.file_url);
              return {
                url: res.file_url,
                name: res.file_name,
                size: stats.size,
                content_type: this.utils.getMimeType(res.file_name),
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
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<GorgiasTicketOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing',
        },
      });

      const resp = await axios.get(`${connection.account_url}/tickets`, {
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
      throw error;
    }
  }
}
