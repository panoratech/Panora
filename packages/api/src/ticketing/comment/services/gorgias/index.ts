import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { GorgiasCommentInput, GorgiasCommentOutput } from './types';
import { ServiceRegistry } from '../registry.service';
import { Utils } from '@ticketing/@lib/@utils';
import * as fs from 'fs';

@Injectable()
export class GorgiasService implements ICommentService {
  private readonly utils: Utils;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + GorgiasService.name,
    );
    this.registry.registerService('gorgias', this);
    this.utils = new Utils();
  }

  async addComment(
    commentData: GorgiasCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<GorgiasCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing',
        },
      });

      let uploads = [];
      const uuids = commentData.attachments as any[];
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
      const data = {
        ...commentData,
        attachments: uploads,
      };

      const resp = await axios.post(
        `${connection.account_url}/tickets/${remoteIdTicket}/messages`,
        JSON.stringify(data),
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
        message: 'Gorgias comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gorgias',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<GorgiasCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
          vertical: 'ticketing',
        },
      });
      //retrieve ticket remote id so we can retrieve the comments in the original software
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/conversations/${ticket.remote_id}/comments`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced gorgias comments !`);

      return {
        data: resp.data._results,
        message: 'Gorgias comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Gorgias',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
