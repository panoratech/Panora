import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CRM_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { CrmObject } from '@crm/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedNoteOutput } from '../types/model.unified';
import { INoteService } from '../types';
import { crm_notes as CrmNote } from '@prisma/client';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';

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
      await this.syncNotes();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_notes table
  //its role is to fetch all notes from providers 3rd parties and save the info inside our db
  async syncNotes() {
    try {
      this.logger.log(`Syncing notes....`);
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
          const providers = CRM_PROVIDERS.filter(
            (provider) => provider !== 'zoho' && provider !== 'freshsales',
          );
          for (const provider of providers) {
            try {
              await this.syncNotesForLinkedUser(
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
  async syncNotesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} notes for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping notes syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.note',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: INoteService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalNoteOutput[]> = await service.syncNotes(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalNoteOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalNoteOutput[]>({
        sourceObject,
        targetType: CrmObject.note,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedNoteOutput[];



      //insert the data in the DB with the fieldMappings (value table)
      const notes_data = await this.saveNotesInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.note.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        notes_data,
        'crm.note.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveNotesInDb(
    linkedUserId: string,
    notes: UnifiedNoteOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmNote[]> {
    try {
      let notes_results: CrmNote[] = [];
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const originId = note.remote_id;

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingNote = await this.prisma.crm_notes.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_crm_note_id: string;

        if (existingNote) {
          // Update the existing note
          let data: any = {
            modified_at: new Date(),
          };
          if (note.content) {
            data = { ...data, content: note.content };
          }
          if (note.contact_id) {
            data = { ...data, id_crm_contact: note.contact_id };
          }
          if (note.company_id) {
            data = { ...data, id_crm_company: note.company_id };
          }
          if (note.deal_id) {
            data = { ...data, id_crm_deal: note.deal_id };
          }
          if (note.user_id) {
            data = { ...data, id_crm_user: note.user_id };
          }

          const res = await this.prisma.crm_notes.update({
            where: {
              id_crm_note: existingNote.id_crm_note,
            },
            data: data,
          });
          unique_crm_note_id = res.id_crm_note;
          notes_results = [...notes_results, res];
        } else {
          // Create a new note
          this.logger.log('note not exists');
          let data: any = {
            id_crm_note: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          if (note.content) {
            data = { ...data, content: note.content };
          }
          if (note.contact_id) {
            data = { ...data, id_crm_contact: note.contact_id };
          }
          if (note.company_id) {
            data = { ...data, id_crm_company: note.company_id };
          }
          if (note.deal_id) {
            data = { ...data, id_crm_deal: note.deal_id };
          }
          if (note.user_id) {
            data = { ...data, id_crm_user: note.user_id };
          }

          const res = await this.prisma.crm_notes.create({
            data: data,
          });
          unique_crm_note_id = res.id_crm_note;
          notes_results = [...notes_results, res];
        }
        // check duplicate or existing values
        if (note.field_mappings && note.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_note_id,
            },
          });

          for (const mapping of note.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: Object.values(mapping)[0]
                    ? Object.values(mapping)[0]
                    : 'null',
                  attribute: {
                    connect: {
                      id_attribute: attribute.id_attribute,
                    },
                  },
                  entity: {
                    connect: {
                      id_entity: entity.id_entity,
                    },
                  },
                },
              });
            }
          }
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_crm_note_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_note_id,
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
      return notes_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
