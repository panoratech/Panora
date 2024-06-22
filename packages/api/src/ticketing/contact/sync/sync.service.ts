import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { SyncError, throwTypedError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

import { TicketingObject } from '@ticketing/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedContactOutput } from '../types/model.unified';
import { IContactService } from '../types';
import { ServiceRegistry } from '../services/registry.service';
import { tcg_contacts as TicketingContact } from '@prisma/client';
import { OriginalContactOutput } from '@@core/utils/types/original/original.ticketing';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
    const jobName = 'ticketing-sync-contacts';

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
  //function used by sync worker which populate our tcg_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncContacts(user_id?: string) {
    try {
      this.logger.log(`Syncing contacts....`);
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
                const providers = TICKETING_PROVIDERS;
                for (const provider of providers) {
                  try {
                    const accounts = await this.prisma.tcg_accounts.findMany();
                    if (accounts) {
                      for (const acc of accounts) {
                        await this.syncContactsForLinkedUser(
                          provider,
                          linkedUser.id_linked_user,
                          id_project,
                          acc.remote_id,
                        );
                      }
                    } else {
                      await this.syncContactsForLinkedUser(
                        provider,
                        linkedUser.id_linked_user,
                        id_project,
                      );
                    }
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
  async syncContactsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
    remote_account_id?: string,
    wh_real_time_trigger?: {
      action: 'UPDATE' | 'DELETE';
      data: {
        remote_id: string;
      };
    },
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} contacts for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping contacts syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.contact',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      let resp: ApiResponse<OriginalContactOutput[]>;
      if (wh_real_time_trigger && wh_real_time_trigger.data.remote_id) {
        //meaning the call has been from a real time webhook that received data from a 3rd party
        switch (wh_real_time_trigger.action) {
          case 'DELETE':
            return await this.removeContactInDb(
              linkedUserId,
              integrationId,
              wh_real_time_trigger.data.remote_id,
            );
          default:
            resp = await service.syncContacts(
              linkedUserId,
              wh_real_time_trigger.data.remote_id,
              remoteProperties,
            );
            break;
        }
      } else {
        resp = await service.syncContacts(
          linkedUserId,
          remote_account_id,
          remoteProperties,
        );
      }
      const sourceObject: OriginalContactOutput[] = resp.data;
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalContactOutput[]
      >({
        sourceObject,
        targetType: TicketingObject.contact,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings,
      })) as UnifiedContactOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const contact_data = await this.saveContactsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
        remote_account_id,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.contact.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        contact_data,
        'ticketing.contact.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveContactsInDb(
    linkedUserId: string,
    contacts: UnifiedContactOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    remote_account_id?: string,
  ): Promise<TicketingContact[]> {
    try {
      let contacts_results: TicketingContact[] = [];
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = contact.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingContact = await this.prisma.tcg_contacts.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_ticketing_contact_id: string;

        if (existingContact) {
          // Update the existing contact
          const data: any = {
            name: existingContact.name,
            email_address: existingContact.email_address,
            phone_number: existingContact.phone_number,
            details: existingContact.details,
            modified_at: new Date(),
          };

          if (remote_account_id) {
            const res = await this.prisma.tcg_accounts.findFirst({
              where: {
                remote_id: remote_account_id,
                remote_platform: originSource,
              },
            });
            data.id_tcg_account = res.id_tcg_account;
          }

          const res = await this.prisma.tcg_contacts.update({
            where: {
              id_tcg_contact: existingContact.id_tcg_contact,
            },
            data: data,
          });

          unique_ticketing_contact_id = res.id_tcg_contact;
          contacts_results = [...contacts_results, res];
        } else {
          // Create a new contact
          // this.logger.log('not existing contact ' + contact.name);
          const data: any = {
            id_tcg_contact: uuidv4(),
            name: contact.name,
            email_address: contact.email_address,
            phone_number: contact.phone_number,
            details: contact.details,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          if (remote_account_id) {
            const res = await this.prisma.tcg_accounts.findFirst({
              where: {
                remote_id: remote_account_id,
                remote_platform: originSource,
              },
            });
            data.id_tcg_account = res.id_tcg_account;
          }
          const res = await this.prisma.tcg_contacts.create({
            data: data,
          });
          contacts_results = [...contacts_results, res];
          unique_ticketing_contact_id = res.id_tcg_contact;
        }

        // check duplicate or existing values
        if (contact.field_mappings && contact.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_contact_id,
            },
          });

          for (const [slug, value] of Object.entries(contact.field_mappings)) {
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
            ressource_owner_id: unique_ticketing_contact_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ticketing_contact_id,
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
      return contacts_results;
    } catch (error) {
      throw error;
    }
  }
  async removeContactInDb(
    linkedUserId: string,
    originSource: string,
    remote_id: string,
  ) {
    const existingContact = await this.prisma.tcg_contacts.findFirst({
      where: {
        remote_id: remote_id,
        remote_platform: originSource,
        id_linked_user: linkedUserId,
      },
    });
    await this.prisma.tcg_contacts.delete({
      where: {
        id_tcg_contact: existingContact.id_tcg_contact,
      },
    });
  }
}
