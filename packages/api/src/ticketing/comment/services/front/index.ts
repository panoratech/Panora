import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FrontCommentInput, FrontCommentOutput } from './types';
import { ServiceRegistry } from '../registry.service';
import { fetchFileStreamFromURL } from '@ticketing/comment/utils';

@Injectable()
export class FrontService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }
  async addComment(
    commentData: FrontCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<FrontCommentOutput>> {
    try {
      //TODO: check required scope  => crm.objects.contacts.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
        },
      });

      let uploads = [];
      const uuids = commentData.attachments;
      if (uuids && uuids.length > 0) {
        for (const uuid of uuids) {
          const res = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: uuid,
            },
          });
          if (!res)
            throw new Error(`tcg_attachment not found for uuid ${uuid}`);
          //TODO: construct the right binary attachment
          //get the AWS s3 right file
          //TODO: check how to send a stream of a url
          const fileStream = await fetchFileStreamFromURL(res.file_url);

          uploads = [...uploads, fileStream];
        }
      }

      let resp;
      if (uploads.length > 0) {
        const dataBody = {
          ...commentData,
          attachments: uploads,
        };
        const formData = new FormData();

        if (dataBody.author_id) {
          formData.append('author_id', dataBody.author_id);
        }
        formData.append('body', dataBody.body);

        for (let i = 0; i < uploads.length; i++) {
          const up = uploads[i];
          formData.append(`attachments[${i}]`, up);
        }

        resp = await axios.post(
          `https://api2.frontapp.com/conversations/${remoteIdTicket}/comments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      } else {
        const dataBody = {
          ...commentData,
        };
        resp = await axios.post(
          `https://api2.frontapp.com/conversations/${remoteIdTicket}/comments`,
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
      }

      return {
        data: resp.data,
        message: 'Front comment created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<FrontCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
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
        `https://api2.frontapp.com/conversations/${ticket.remote_id}/comments`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced front comments !`);

      return {
        data: resp.data._results,
        message: 'Front comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
