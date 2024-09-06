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
import { ServiceRegistry } from '../registry.service';
import { LinearCommentInput, LinearCommentOutput } from './types';

@Injectable()
export class LinearService implements ICommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private utils: Utils,
  ) {
    this.logger.setContext(
      TicketingObject.comment.toUpperCase() + ':' + LinearService.name,
    );
    this.registry.registerService('linear', this);
  }

  async addComment(
    commentData: LinearCommentInput,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<LinearCommentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'linear',
          vertical: 'ticketing',
        },
      });

      // Skipping Storing the attachment in unified object as Linear stores attachment as link in Markdown Format

      const createCommentMutation = {
        query: `mutation { commentCreate( input: { body: \"${commentData.body}\" issueId: \"${remoteIdTicket}\" } ) { comment { body issue { id } user { id } } }}`,
      };

      const resp = await axios.post(
        `${connection.account_url}`,
        createCommentMutation,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Created linear comment !`);

      return {
        data: resp.data.data.commentCreate.comment,
        message: 'Linear comment created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<LinearCommentOutput[]>> {
    try {
      const { linkedUserId, id_ticket } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'linear',
          vertical: 'ticketing',
        },
      });

      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticket as string,
        },
        select: {
          remote_id: true,
        },
      });

      const commentQuery = {
        query: `query { issue(id: \"${ticket.remote_id}\") { comments { nodes { id body user { id } issue { id } } } }}`,
      };

      const resp = await axios.post(`${connection.account_url}`, commentQuery, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced linear comments !`);

      return {
        data: resp.data.data.issue.comments.nodes,
        message: 'Linear comments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
