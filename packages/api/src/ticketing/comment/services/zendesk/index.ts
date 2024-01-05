import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@utils/@types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../registry.service';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import { EnvironmentService } from '@@core/environment/environment.service';
@Injectable()
export class ZendeskService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk_t', this);
  }

  async addComment(
    commentData: ZendeskCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<ZendeskCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
        },
      });

      // We must fetch tokens from zendesk with the commentData.uploads array of Attachment uuids
      const uuids = commentData.uploads;
      let uploads = [];
      uuids.map(async (uuid) => {
        const res = await this.prisma.tcg_attachments.findUnique({
          where: {
            id_tcg_attachment: uuid,
          },
        });
        if (!res) throw new Error(`tcg_attachment not found for uuid ${uuid}`);

        //TODO:; fetch the right file from AWS s3
        const s3File = '';
        const url = `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/uploads.json?filename=${
          res.file_name
        }`;

        const resp = await axios.get(url, {
          headers: {
            'Content-Type': 'image/png', //TODO: get the right content-type given a file name extension
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        });
        uploads = [...uploads, resp.data.upload.token];
      });
      const finalData = {
        ...commentData,
        uploads: uploads,
      };
      const dataBody = {
        ticket: {
          comment: finalData,
        },
      };
      //to add a comment on Zendesk you must update a ticket using the Ticket API
      const resp = await axios.put(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets/${remoteIdTicket}.json`,
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
        message: 'Zendesk comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<OriginalCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
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
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/tickets/${
          ticket.remote_id
        }/comments.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zendesk comments !`);

      return {
        data: resp.data.comments,
        message: 'Zendesk comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
