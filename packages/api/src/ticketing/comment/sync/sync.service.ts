import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '@ticketing/@utils/@registry/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { tcg_comments as TicketingComment } from '@prisma/client';
import { UnifiedCommentOutput } from '../types/model.unified';
import { ICommentService } from '../types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class SyncCommentsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncCommentsService.name);
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
              await this.syncCommentsForLinkedUser(
                provider,
                linkedUser.id_linked_user,
                id_project,
              );
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
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.comment.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;

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
        await service.syncComments(linkedUserId, remoteProperties);

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
        job_id,
        sourceObject,
      );
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });
      await this.webhook.handleWebhook(
        comments_data,
        'ticketing.comment.pulled',
        id_project,
        job_id,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveCommentsInDb(
    linkedUserId: string,
    tickets: UnifiedCommentOutput[],
    originIds: string[],
    originSource: string,
    jobId: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingComment[]> {
    return;
  }
}
