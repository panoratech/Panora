import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './zendesk';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '../types/model.unified';
import { CommentResponse } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private zendesk: ZendeskService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
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
    return;
  }

  async addComment(
    unifiedCommentData: UnifiedCommentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<CommentResponse>> {
    return;
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
