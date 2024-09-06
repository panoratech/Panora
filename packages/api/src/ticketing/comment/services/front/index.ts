import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ICommentService } from '@ticketing/comment/types';
import axios from 'axios';
import * as FormData from 'form-data';
import { ServiceRegistry } from '../registry.service';
import { FrontCommentInput, FrontCommentOutput } from './types';

@Injectable()
export class FrontService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
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
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });

      let dataBody = commentData;

      const author_id = commentData.author_id;

      if (author_id) {
        dataBody = { ...dataBody, author_id: author_id };
      }

      // Process attachments
      let uploads = [];
      const uuids = commentData.attachments;
      if (uuids && uuids.length > 0) {
        uploads = await Promise.all(
          uuids.map(async (uuid) => {
            const attachment = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!attachment) {
              throw new ReferenceError(
                `tcg_attachment not found for uuid ${uuid}`,
              );
            }
            // TODO: Construct the right binary attachment
            // Get the AWS S3 right file
            // TODO: Check how to send a stream of a URL
            return await this.utils.fetchFileStreamFromURL(attachment.file_url);
          }),
        );
      }

      // Prepare request data
      let resp;
      if (uploads.length > 0) {
        const formData = new FormData();
        if (author_id) {
          formData.append('author_id', author_id);
        }
        formData.append('body', commentData.body);
        uploads.forEach((fileStream, index) => {
          formData.append(`attachments[${index}]`, fileStream);
        });

        // Send request with attachments
        resp = await axios.post(
          `${connection.account_url}/conversations/${remoteIdTicket}/comments`,
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
        // Send request without attachments
        resp = await axios.post(
          `${connection.account_url}/conversations/${remoteIdTicket}/comments`,
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

      // Return response
      return {
        data: resp.data,
        message: 'Front comment created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<FrontCommentOutput[]>> {
    try {
      const { linkedUserId, id_ticket } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });
      //retrieve ticket remote id so we can retrieve the comments in the original software
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/conversations/${ticket.remote_id}/comments`,
        {
          headers: {
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
      throw error;
    }
  }
}
