import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedAttachmentOutput } from '../types/model.unified';
import { IAttachmentService } from '../types';
import { ServiceRegistry } from '../services/registry.service';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { tcg_attachments as TicketingAttachment } from '@prisma/client';

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
      await this.syncAttachments();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our tcg_attachments table
  //its role is to fetch all attachments from providers 3rd parties and save the info inside our db
  async syncAttachments() {
    try {
      this.logger.log(`Syncing attachments....`);
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
              //call the sync attachments for every ticket of the linkedUser (a attachment is tied to a ticket)
              const tickets = await this.prisma.tcg_tickets.findMany({
                where: {
                  remote_platform: provider,
                  events: {
                    id_linked_user: linkedUser.id_linked_user,
                  },
                },
              });
              for (const ticket of tickets) {
                await this.syncAttachmentsForLinkedUser(
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
  async syncAttachmentsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    id_ticket: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} attachments for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) throw new Error('connection not found');

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'attachment',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IAttachmentService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalAttachmentOutput[]> =
        await service.syncAttachments(linkedUserId, remoteProperties);

      const sourceObject: OriginalAttachmentOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
        sourceObject,
        targetType: TicketingObject.attachment,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedAttachmentOutput[];

      //TODO
      const attachmentsIds = sourceObject.map((attachment) =>
        'id' in attachment ? String(attachment.id) : undefined,
      );
      //insert the data in the DB with the fieldMappings (value table)
      const attachments_data = await this.saveAttachmentsInDb(
        linkedUserId,
        unifiedObject,
        attachmentsIds,
        integrationId,
        id_ticket,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.attachment.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        attachments_data,
        'ticketing.attachment.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveAttachmentsInDb(
    linkedUserId: string,
    attachments: UnifiedAttachmentOutput[],
    originIds: string[],
    originSource: string,
    id_ticket: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAttachment[]> {
    try {
      let attachments_results: TicketingAttachment[] = [];
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingAttachment = await this.prisma.tcg_attachments.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_attachment_id: string;

        if (existingAttachment) {
          // Update the existing attachment
          const res = await this.prisma.tcg_attachments.update({
            where: {
              id_tcg_attachment: existingAttachment.id_tcg_attachment,
            },
            data: {
              //TODO
              id_tcg_ticket: id_ticket,
              modified_at: new Date(),
            },
          });
          unique_ticketing_attachment_id = res.id_tcg_attachment;
          attachments_results = [...attachments_results, res];
        } else {
          // Create a new attachment
          this.logger.log('attachment not exists');
          const data = {
            id_tcg_attachment: uuidv4(),
            //TODO
            created_at: new Date(),
            modified_at: new Date(),
            id_tcg_ticket: id_ticket,
            id_linkedUser: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
            //TODO; id_tcg_contact  String?       @db.Uuid
            //TODO; id_tcg_user     String?       @db.Uuid
          };
          const res = await this.prisma.tcg_attachments.create({
            data: data,
          });
          attachments_results = [...attachments_results, res];
          unique_ticketing_attachment_id = res.id_tcg_attachment;
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ticketing_attachment_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_attachment_id,
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
      return attachments_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
