import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { tcg_comments as TicketingComment } from '@prisma/client';
import { UnifiedCommentOutput } from '../types/model.unified';
import { ICommentService } from '../types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../services/registry.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.syncComments();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our tcg_comments table
  //its role is to fetch all comments from providers 3rd parties and save the info inside our db
  async syncComments() {
    try {
      this.logger.log(`Syncing comments....`);
      const defaultOrg = await this.prisma.organizations.findFirst({
        where: {
          name: 'Acme Inc',
        },
      });

      const defaultProject = await this.prisma.projects.findFirst({
        where: {
          id_organization: defaultOrg.id_organization,
          name: 'Project 1',
        },
      });
      const id_project = defaultProject.id_project;
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
              //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
              const tickets = await this.prisma.tcg_tickets.findMany({
                where: {
                  remote_platform: provider,
                  id_linked_user: linkedUser.id_linked_user,
                },
              });
              for (const ticket of tickets) {
                await this.syncCommentsForLinkedUser(
                  provider,
                  linkedUser.id_linked_user,
                  id_project,
                  ticket.id_tcg_ticket,
                );
              }
            } catch (error) {
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncCommentsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    id_ticket: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} comments for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) return;

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'comment',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ICommentService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalCommentOutput[]> =
        await service.syncComments(linkedUserId, id_ticket, remoteProperties);

      const sourceObject: OriginalCommentOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalCommentOutput[]>({
        sourceObject,
        targetType: TicketingObject.comment,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedCommentOutput[];

      //TODO
      const commentsIds = sourceObject.map((comment) =>
        'id' in comment ? String(comment.id) : undefined,
      );
      //insert the data in the DB with the fieldMappings (value table)
      const comments_data = await this.saveCommentsInDb(
        linkedUserId,
        unifiedObject,
        commentsIds,
        integrationId,
        id_ticket,
        sourceObject,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.comment.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        comments_data,
        'ticketing.comment.synced',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveCommentsInDb(
    linkedUserId: string,
    comments: UnifiedCommentOutput[],
    originIds: string[],
    originSource: string,
    id_ticket: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingComment[]> {
    try {
      let comments_results: TicketingComment[] = [];
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingComment = await this.prisma.tcg_comments.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
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
              body: comment.body,
              html_body: comment.html_body,
              is_private: comment.is_private,
              creator_type: comment.creator_type,
              id_tcg_ticket: id_ticket,
              modified_at: new Date(),
            },
          });
          unique_ticketing_comment_id = res.id_tcg_comment;
          comments_results = [...comments_results, res];
        } else {
          // Create a new comment
          this.logger.log('comment not exists');
          const data = {
            id_tcg_comment: uuidv4(),
            body: comment.body,
            html_body: comment.html_body,
            is_private: comment.is_private,
            created_at: new Date(),
            modified_at: new Date(),
            creator_type: comment.creator_type,
            id_tcg_ticket: id_ticket,
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
            //TODO; id_tcg_contact  String?       @db.Uuid
            //TODO; id_tcg_user     String?       @db.Uuid
          };
          const res = await this.prisma.tcg_comments.create({
            data: data,
          });
          comments_results = [...comments_results, res];
          unique_ticketing_comment_id = res.id_tcg_comment;
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_comment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_comment_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return comments_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
