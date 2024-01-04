import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '../types/model.unified';
import { CommentResponse, ICommentService } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { unify } from '@@core/utils/unification/unify';
import { ServiceRegistry } from './registry.service';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CommentService.name);
  }

  async batchAddComments(
    unifiedCommentData: UnifiedCommentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const responses = await Promise.all(
        unifiedCommentData.map((unifiedData) =>
          this.addComment(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      const allComments = responses.flatMap(
        (response) => response.data.comments,
      );
      const allRemoteData = responses.flatMap(
        (response) => response.data.remote_data || [],
      );

      return {
        data: {
          comments: allComments,
          remote_data: allRemoteData,
        },
        message: 'All comments inserted successfully',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async addComment(
    unifiedCommentData: UnifiedCommentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.comment.created', //sync, push or pull
          method: 'POST',
          url: '/ticketing/comment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;

      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<UnifiedCommentInput>({
        sourceObject: unifiedCommentData,
        targetType: TicketingObject.comment,
        providerName: integrationId,
        customFieldMappings: [],
      });

      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      //get remote_id of the ticket so the comment is inserted successfully
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: unifiedCommentData.ticket_id,
        },
        select: {
          remote_id: true,
        },
      });
      const resp: ApiResponse<OriginalCommentOutput> = await service.addComment(
        desunifiedObject,
        linkedUserId,
        ticket.remote_id,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalCommentOutput[]>({
        sourceObject: [resp.data],
        targetType: TicketingObject.comment,
        providerName: integrationId,
        customFieldMappings: [],
      })) as UnifiedCommentOutput[];

      // add the comment inside our db
      const source_comment = resp.data;
      const target_comment = unifiedObject[0];
      const originId =
        'id' in source_comment ? String(source_comment.id) : undefined; //TODO

      const existingComment = await this.prisma.tcg_comments.findFirst({
        where: {
          remote_id: originId,
          remote_platform: integrationId,
          events: {
            id_linked_user: linkedUserId,
          },
        },
      });

      let unique_ticketing_comment_id: string;

      if (existingComment) {
        // Update the existing comment
        const res = await this.prisma.tcg_comments.update({
          where: {
            id_tcg_comment: existingComment.id_tcg_comment,
          },
          data: {
            body: target_comment.body,
            html_body: target_comment.html_body,
            is_private: target_comment.is_private,
            creator_type: target_comment.creator_type,
            id_tcg_ticket: target_comment.ticket_id,
            id_event: job_id,
            modified_at: new Date(),
          },
        });
        unique_ticketing_comment_id = res.id_tcg_comment;
      } else {
        // Create a new comment
        this.logger.log('comment not exists');
        const data = {
          id_tcg_comment: uuidv4(),
          body: target_comment.body,
          html_body: target_comment.html_body,
          is_private: target_comment.is_private,
          created_at: new Date(),
          modified_at: new Date(),
          creator_type: target_comment.creator_type,
          id_tcg_ticket: target_comment.ticket_id,
          id_event: job_id,
          remote_id: originId,
          remote_platform: integrationId,
          //TODO; id_tcg_contact  String?       @db.Uuid
          //TODO; id_tcg_user     String?       @db.Uuid
        };
        const res = await this.prisma.tcg_comments.create({
          data: data,
        });
        unique_ticketing_comment_id = res.id_tcg_comment;
      }

      if (remote_data) {
        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_comment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_comment_id,
            format: 'json',
            data: JSON.stringify(source_comment),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(source_comment),
            created_at: new Date(),
          },
        });
      }

      /////
      const result_comment = await this.getComment(
        unique_ticketing_comment_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: status_resp,
        },
      });
      await this.webhook.handleWebhook(
        result_comment.data.comments,
        'ticketing.comment.created',
        linkedUser.id_project,
        job_id,
      );
      return { ...resp, data: result_comment.data };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getComment(
    id_commenting_comment: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<CommentResponse>> {
    return;
  }

  async getComments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<CommentResponse>> {
    return;
  }
  //TODO
  async updateComment(
    id: string,
    updateCommentData: Partial<UnifiedCommentInput>,
  ): Promise<ApiResponse<CommentResponse>> {
    try {
    } catch (error) {
      handleServiceError(error, this.logger);
    }
    // TODO: fetch the comment from the database using 'id'
    // TODO: update the comment with 'updateCommentData'
    // TODO: save the updated comment back to the database
    // TODO: return the updated comment
    return;
  }
}
