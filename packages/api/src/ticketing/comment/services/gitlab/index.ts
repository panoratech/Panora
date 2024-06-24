import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { GitlabCommentInput, GitlabCommentOutput } from './types';
import { ServiceRegistry } from '../registry.service';
import { Utils } from '@ticketing/@lib/@utils';
import * as fs from 'fs';

@Injectable()
export class GitlabService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + GitlabService.name,
    );
    this.registry.registerService('gitlab', this);
  }

  async addComment(
    commentData: GitlabCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<GitlabCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
          vertical: 'ticketing',
        },
      });

      let uploads = [];
      const uuids = commentData.attachment as any[];
      if (uuids && uuids.length > 0) {
        const attachmentPromises = uuids.map(async (uuid) => {
          const res = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: uuid.extra,
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

      const ticket = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remoteIdTicket,
          remote_platform: 'gitlab',
        },
        select: {
          collections: true,
          id_tcg_ticket: true,
        },
      });

      const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
        ticket.collections[0],
      );

      // Retrieve the uuid of issue from remote_data
      const remote_data = await this.prisma.remote_data.findFirst({
        where: {
          ressource_owner_id: ticket.id_tcg_ticket,
        },
      });
      const { iid } = JSON.parse(remote_data.data);

      const resp = await axios.post(
        `${connection.account_url}/projects/${remote_project_id}/issues/${iid}/notes`,
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
        message: 'Gitlab comment created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'gitlab',
        TicketingObject.comment,
        ActionType.POST,
      );
    }
  }
  async syncComments(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<GitlabCommentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gitlab',
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
          collections: true,
        },
      });

      // retrieve the remote_id of project from collections
      const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
        ticket.collections[0],
      );

      // Retrieve the uuid of issue from remote_data
      const remote_data = await this.prisma.remote_data.findFirst({
        where: {
          ressource_owner_id: id_ticket,
        },
      });
      const { iid } = JSON.parse(remote_data.data);

      console.log(
        'Requested URL : ',
        `${connection.account_url}/projects/${remote_project_id}/issues/${iid}/notes`,
      );

      const resp = await axios.get(
        `${connection.account_url}/projects/${remote_project_id}/issues/${iid}/notes`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced gitlab comments !`);
      console.log(resp.data);

      return {
        data: resp.data,
        message: 'Gitlab comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'gitlab',
        TicketingObject.comment,
        ActionType.GET,
      );
    }
  }
}
