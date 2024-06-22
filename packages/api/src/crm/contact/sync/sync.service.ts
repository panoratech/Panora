import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';

import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedContactOutput } from '@crm/contact/types/model.unified';
import { CrmObject } from '@crm/@lib/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { crm_contacts as CrmContact } from '@prisma/client';
import { IContactService } from '../types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { ServiceRegistry } from '../services/registry.service';
import { CRM_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Utils } from '@crm/@lib/@utils';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
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
    const jobName = 'crm-sync-contacts';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    console.log(`Found ${jobs.length} repeatable jobs.`);
    for (const job of jobs) {
      console.log(`Checking job: ${job.name}`);
      if (job.name === jobName) {
        console.log(`Removing job with key: ${job.key}`);
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }

    // Add new job to the queue with a CRON expression
    console.log(`Adding new job: ${jobName}`);
    await this.syncQueue
      .add(
        jobName,
        {},
        {
          repeat: { cron: '*/2 * * * *' }, // Runs once a day at midnight
        },
      )
      .then(() => {
        console.log('Crm Sync Contact Job added successfully');
      })
      .catch((error) => {
        console.error('Failed to add job', error);
      });
  }

  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
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
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
                for (const provider of providers) {
                  try {
                    await this.syncContactsForLinkedUser(
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
  async syncContactsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
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
          vertical: 'crm',
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
          'crm.contact',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalContactOutput[]> =
        await service.syncContacts(linkedUserId, remoteProperties);

      const sourceObject: OriginalContactOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalContactOutput[]
      >({
        sourceObject,
        targetType: CrmObject.contact,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings,
      })) as UnifiedContactOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const contacts_data = await this.saveContactsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.contact.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        contacts_data,
        'crm.contact.pulled',
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
  ): Promise<CrmContact[]> {
    try {
      let contacts_results: CrmContact[] = [];
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = contact.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingContact = await this.prisma.crm_contacts.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
          include: {
            crm_email_addresses: true,
            crm_phone_numbers: true,
            crm_addresses: true,
          },
        });

        const { normalizedEmails, normalizedPhones } =
          this.utils.normalizeEmailsAndNumbers(
            contact.email_addresses,
            contact.phone_numbers,
          );

        const normalizedAddresses = this.utils.normalizeAddresses(
          contact.addresses,
        );

        let unique_crm_contact_id: string;

        if (existingContact) {
          // Update the existing contact
          let data: any = {
            modified_at: new Date(),
            first_name: '',
            last_name: '',
          };

          if (contact.first_name) {
            data = { ...data, first_name: contact.first_name };
          }
          if (contact.last_name) {
            data = { ...data, last_name: contact.last_name };
          }
          if (contact.user_id) {
            data = {
              ...data,
              id_crm_user: contact.user_id,
            };
          }

          const res = await this.prisma.crm_contacts.update({
            where: {
              id_crm_contact: existingContact.id_crm_contact,
            },
            data: data,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email, index) => {
                if (
                  existingContact &&
                  existingContact.crm_email_addresses[index]
                ) {
                  return this.prisma.crm_email_addresses.update({
                    where: {
                      id_crm_email:
                        existingContact.crm_email_addresses[index].id_crm_email,
                    },
                    data: email,
                  });
                } else {
                  return this.prisma.crm_email_addresses.create({
                    data: {
                      ...email,
                      id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                    },
                  });
                }
              }),
            );
          }
          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map((phone, index) => {
                if (
                  existingContact &&
                  existingContact.crm_phone_numbers[index]
                ) {
                  return this.prisma.crm_phone_numbers.update({
                    where: {
                      id_crm_phone_number:
                        existingContact.crm_phone_numbers[index]
                          .id_crm_phone_number,
                    },
                    data: phone,
                  });
                } else {
                  return this.prisma.crm_phone_numbers.create({
                    data: {
                      ...phone,
                      id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                    },
                  });
                }
              }),
            );
          }
          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((addy, index) => {
                if (existingContact && existingContact.crm_addresses[index]) {
                  return this.prisma.crm_addresses.update({
                    where: {
                      id_crm_address:
                        existingContact.crm_addresses[index].id_crm_address,
                    },
                    data: addy,
                  });
                } else {
                  return this.prisma.crm_addresses.create({
                    data: {
                      ...addy,
                      id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                    },
                  });
                }
              }),
            );
          }

          unique_crm_contact_id = res.id_crm_contact;
          contacts_results = [...contacts_results, res];
        } else {
          // Create a new contact
          this.logger.log('not existing contact ' + contact.first_name);
          const uuid = uuidv4();
          let data: any = {
            id_crm_contact: uuid,
            first_name: '',
            last_name: '',
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (contact.first_name) {
            data = { ...data, first_name: contact.first_name };
          }
          if (contact.last_name) {
            data = { ...data, last_name: contact.last_name };
          }
          if (contact.user_id) {
            data = {
              ...data,
              id_crm_user: contact.user_id,
            };
          }

          const newContact = await this.prisma.crm_contacts.create({
            data: data,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email) =>
                this.prisma.crm_email_addresses.create({
                  data: {
                    ...email,
                    id_crm_contact: newContact.id_crm_contact,
                  },
                }),
              ),
            );
          }

          if (normalizedPhones && normalizedPhones.length > 0) {
            await Promise.all(
              normalizedPhones.map((phone) =>
                this.prisma.crm_phone_numbers.create({
                  data: {
                    ...phone,
                    id_crm_contact: newContact.id_crm_contact,
                  },
                }),
              ),
            );
          }

          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((addy) =>
                this.prisma.crm_addresses.create({
                  data: {
                    ...addy,
                    id_crm_contact: newContact.id_crm_contact,
                  },
                }),
              ),
            );
          }

          unique_crm_contact_id = newContact.id_crm_contact;
          contacts_results = [...contacts_results, newContact];
        }
        // check duplicate or existing values
        if (contact.field_mappings && contact.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_contact_id,
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
            ressource_owner_id: unique_crm_contact_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_contact_id,
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
}
