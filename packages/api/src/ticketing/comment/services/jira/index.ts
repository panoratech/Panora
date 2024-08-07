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
import * as fs from 'fs';
import { ServiceRegistry } from '../registry.service';
import { JiraCommentInput, JiraCommentOutput } from './types';

@Injectable()
export class JiraService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
  }

  async addComment(
    commentData: JiraCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<JiraCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });

      // Send request without attachments
      const resp = await axios.post(
        `${connection.account_url}/3/issue/${remoteIdTicket}/comment`,
        JSON.stringify(commentData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      //add attachments
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

      if (uploads.length > 0) {
        const formData = new FormData();

        uploads.forEach((fileStream, index) => {
          const stats = fs.statSync(fileStream);
          const fileSizeInBytes = stats.size;
          formData.append('file', fileStream, { knownLength: fileSizeInBytes });
        });

        // Send request with attachments
        const resp_ = await axios.post(
          `${connection.account_url}/3/issue/${remoteIdTicket}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Atlassian-Token': 'no-check',
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
        message: 'Jira comment created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<JiraCommentOutput[]>> {
    try {
      const { linkedUserId, id_ticket } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
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
        `${connection.account_url}/3/issue/${ticket.remote_id}/comment`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced jira comments !`);

      return {
        data: resp.data.comments,
        message: 'Jira comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
