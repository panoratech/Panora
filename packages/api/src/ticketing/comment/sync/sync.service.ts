import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_comments as TicketingComment } from '@prisma/client';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ICommentService } from '../types';
import { UnifiedTicketingCommentOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'comment', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_comments table
  //its role is to fetch all comments from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = TICKETING_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_ticket } = data;
      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: comment} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingCommentOutput,
        OriginalCommentOutput,
        ICommentService
      >(integrationId, linkedUserId, 'ticketing', 'comment', service, [
        {
          param: id_ticket,
          paramName: 'id_ticket',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    comments: UnifiedTicketingCommentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_ticket?: string,
  ): Promise<TicketingComment[]> {
    try {
      const comments_results: TicketingComment[] = [];

      const updateOrCreateComment = async (
        comment: UnifiedTicketingCommentOutput,
        originId: string,
        connection_id: string,
        id_ticket?: string,
      ) => {
        const existingComment = await this.prisma.tcg_comments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const opts =
          comment.creator_type === 'CONTACT' && comment.contact_id
            ? { id_tcg_contact: comment.contact_id }
            : comment.creator_type === 'USER' && comment.user_id
            ? { id_tcg_user: comment.user_id }
            : {};

        const baseData: any = {
          id_tcg_ticket: id_ticket ?? null,
          modified_at: new Date(),
          body: comment.body ?? null,
          html_body: comment.html_body ?? null,
          is_private: comment.is_private ?? null,
          creator_type: comment.creator_type ?? null,
          id_tcg_attachment: [],
          ...opts,
        };

        if (existingComment) {
          return await this.prisma.tcg_comments.update({
            where: {
              id_tcg_comment: existingComment.id_tcg_comment,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_comments.create({
            data: {
              ...baseData,
              id_tcg_comment: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const originId = comment.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateComment(
          comment,
          originId,
          connection_id,
          id_ticket,
        );
        const comment_id = res.id_tcg_comment;
        comments_results.push(res);

        // Save attachments if present
        if (comment.attachments) {
          await this.registry.getService('ticketing', 'attachment').saveToDb(
            connection_id,
            linkedUserId,
            comment.attachments,
            originSource,
            comment.attachments.map((att: UnifiedTicketingAttachmentOutput) => {
              return att.remote_data;
            }),
            {
              object_name: 'comment',
              value: comment_id,
            },
          );
        }

        await this.ingestService.processRemoteData(comment_id, remote_data[i]);
      }
      return comments_results;
    } catch (error) {
      throw error;
    }
  }
}
