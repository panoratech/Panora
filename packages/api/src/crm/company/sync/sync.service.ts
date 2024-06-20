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
import { UnifiedCompanyOutput } from '../types/model.unified';
import { ICompanyService } from '../types';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { crm_companies as CrmCompany } from '@prisma/client';
import { CRM_PROVIDERS } from '@panora/shared';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
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
    const jobName = 'crm-sync-companies';

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

  //function used by sync worker which populate our crm_companies table
  //its role is to fetch all companies from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncCompanies(user_id?: string) {
    try {
      this.logger.log(`Syncing companies....`);
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
                    await this.syncCompaniesForLinkedUser(
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
  async syncCompaniesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} companies for linkedUser ${linkedUserId}`,
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
          `Skipping companies syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.company',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ICompanyService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalCompanyOutput[]> =
        await service.syncCompanies(linkedUserId, remoteProperties);

      const sourceObject: OriginalCompanyOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCompanyOutput[]
      >({
        sourceObject,
        targetType: CrmObject.company,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings,
      })) as UnifiedCompanyOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const companies_data = await this.saveCompanysInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.company.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        companies_data,
        'crm.company.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveCompanysInDb(
    linkedUserId: string,
    companies: UnifiedCompanyOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmCompany[]> {
    try {
      let companies_results: CrmCompany[] = [];
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const originId = company.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingCompany = await this.prisma.crm_companies.findFirst({
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
            company.email_addresses,
            company.phone_numbers,
          );

        const normalizedAddresses = this.utils.normalizeAddresses(
          company.addresses,
        );

        let unique_crm_company_id: string;

        if (existingCompany) {
          // Update the existing company
          let data: any = {
            modified_at: new Date(),
          };
          if (company.name) {
            data = { ...data, name: company.name };
          }
          if (company.industry) {
            data = { ...data, industry: company.industry };
          }
          if (company.number_of_employees) {
            data = {
              ...data,
              number_of_employees: company.number_of_employees,
            };
          }
          if (company.user_id) {
            data = { ...data, id_crm_user: company.user_id };
          }

          const res = await this.prisma.crm_companies.update({
            where: {
              id_crm_company: existingCompany.id_crm_company,
            },
            data: data,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email, index) => {
                if (
                  existingCompany &&
                  existingCompany.crm_email_addresses[index]
                ) {
                  return this.prisma.crm_email_addresses.update({
                    where: {
                      id_crm_email:
                        existingCompany.crm_email_addresses[index].id_crm_email,
                    },
                    data: email,
                  });
                } else {
                  return this.prisma.crm_email_addresses.create({
                    data: {
                      ...email,
                      id_crm_company: existingCompany.id_crm_company, // Assuming 'uuid' is the ID of the related contact
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
                  existingCompany &&
                  existingCompany.crm_phone_numbers[index]
                ) {
                  return this.prisma.crm_phone_numbers.update({
                    where: {
                      id_crm_phone_number:
                        existingCompany.crm_phone_numbers[index]
                          .id_crm_phone_number,
                    },
                    data: phone,
                  });
                } else {
                  return this.prisma.crm_phone_numbers.create({
                    data: {
                      ...phone,
                      id_crm_company: existingCompany.id_crm_company,
                    },
                  });
                }
              }),
            );
          }
          if (normalizedAddresses && normalizedAddresses.length > 0) {
            await Promise.all(
              normalizedAddresses.map((addy, index) => {
                if (existingCompany && existingCompany.crm_addresses[index]) {
                  return this.prisma.crm_addresses.update({
                    where: {
                      id_crm_address:
                        existingCompany.crm_addresses[index].id_crm_address,
                    },
                    data: addy,
                  });
                } else {
                  return this.prisma.crm_addresses.create({
                    data: {
                      ...addy,
                      id_crm_company: existingCompany.id_crm_company, // Assuming 'uuid' is the ID of the related contact
                    },
                  });
                }
              }),
            );
          }
          unique_crm_company_id = res.id_crm_company;
          companies_results = [...companies_results, res];
        } else {
          // Create a new company
          this.logger.log('company not exists');
          const uuid = uuidv4();
          let data: any = {
            id_crm_company: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (company.name) {
            data = { ...data, name: company.name };
          }
          if (company.industry) {
            data = { ...data, industry: company.industry };
          }
          if (company.number_of_employees) {
            data = {
              ...data,
              number_of_employees: company.number_of_employees,
            };
          }
          if (company.user_id) {
            data = { ...data, id_crm_user: company.user_id };
          }

          const newCompany = await this.prisma.crm_companies.create({
            data: data,
          });

          if (normalizedEmails && normalizedEmails.length > 0) {
            await Promise.all(
              normalizedEmails.map((email) =>
                this.prisma.crm_email_addresses.create({
                  data: {
                    ...email,
                    id_crm_company: newCompany.id_crm_company,
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
                    id_crm_company: newCompany.id_crm_company,
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
                    id_crm_company: newCompany.id_crm_company,
                  },
                }),
              ),
            );
          }
          unique_crm_company_id = newCompany.id_crm_company;
          companies_results = [...companies_results, newCompany];
        }

        // check duplicate or existing values
        if (company.field_mappings && company.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_company_id,
            },
          });

          for (const [slug, value] of Object.entries(company.field_mappings)) {
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
            ressource_owner_id: unique_crm_company_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_company_id,
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
      return companies_results;
    } catch (error) {
      throw error;
    }
  }
}
