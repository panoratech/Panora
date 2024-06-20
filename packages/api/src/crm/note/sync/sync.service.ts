import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedNoteOutput } from '../types/model.unified';
import { INoteService } from '../types';
import { crm_notes as CrmNote } from '@prisma/client';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'crm-sync-notes';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
  }
  //function used by sync worker which populate our crm_notes table
  //its role is to fetch all notes from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncNotes(user_id?: string) {
    try {
      this.logger.log(`Syncing notes....`);
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
                for (const provider of providers) {
                  try {
                    await this.syncNotesForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                      id_project,
                    );
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
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
          vertical: 'crm',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping notes syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
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
      const unifiedObject = (await this.coreUnification.unify<
        OriginalNoteOutput[]
      >({
        sourceObject,
        targetType: CrmObject.note,
        providerName: integrationId,
        vertical: 'crm',
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
      throw error;
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
          throw new ReferenceError(`Origin id not there, found ${originId}`);
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

          for (const [slug, value] of Object.entries(note.field_mappings)) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: value || 'null',
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
      throw error;
    }
  }
}
