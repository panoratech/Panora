import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
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
import { Utils } from '@crm/@lib/@utils';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('crm', 'contact', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'crm-sync-contacts',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }
  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
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
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedContactOutput,
        OriginalContactOutput,
        IContactService
      >(integrationId, linkedUserId, 'crm', 'contact', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedContactOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmContact[]> {
    try {
      const contacts_results: CrmContact[] = [];

      const updateOrCreateContact = async (
        contact: UnifiedContactOutput,
        originId: string,
      ) => {
        const existingContact = await this.prisma.crm_contacts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
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

        const baseData: any = {
          first_name: contact.first_name ?? null,
          last_name: contact.last_name ?? null,
          id_crm_user: contact.user_id ?? null,
          modified_at: new Date(),
        };

        if (existingContact) {
          const res = await this.prisma.crm_contacts.update({
            where: {
              id_crm_contact: existingContact.id_crm_contact,
            },
            data: baseData,
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
                      id_crm_contact: existingContact.id_crm_contact,
                      id_connection: connection_id,
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
                      id_crm_contact: existingContact.id_crm_contact,
                      id_connection: connection_id,
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
                      id_crm_contact: existingContact.id_crm_contact,
                      id_connection: connection_id,
                    },
                  });
                }
              }),
            );
          }
          return res;
        } else {
          const uuid = uuidv4();
          const newContact = await this.prisma.crm_contacts.create({
            data: {
              ...baseData,
              id_crm_contact: uuid,
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email) =>
                this.prisma.crm_email_addresses.create({
                  data: {
                    ...email,
                    id_crm_contact: newContact.id_crm_contact,
                    id_connection: connection_id,
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
                    id_connection: connection_id,
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
                    id_connection: connection_id,
                  },
                }),
              ),
            );
          }
          return newContact;
        }
      };

      for (let i = 0; i < data.length; i++) {
        const contact = data[i];
        const originId = contact.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateContact(contact, originId);
        const contact_id = res.id_crm_contact;
        contacts_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          contact.field_mappings,
          contact_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(contact_id, remote_data[i]);
      }
      return contacts_results;
    } catch (error) {
      throw error;
    }
  }
}
