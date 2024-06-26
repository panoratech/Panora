import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedCompanyOutput } from '../types/model.unified';
import { ICompanyService } from '../types';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { crm_companies as CrmCompany } from '@prisma/client';
import { CRM_PROVIDERS } from '@panora/shared';
import { Utils } from '@crm/@lib/@utils';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('crm', 'company', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'crm-sync-companies',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
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
      if (!service) return;
      const resp: ApiResponse<OriginalCompanyOutput[]> =
        await service.syncCompanies(linkedUserId, remoteProperties);

      const sourceObject: OriginalCompanyOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedCompanyOutput,
        OriginalCompanyOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'crm',
        'company',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCompanyOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmCompany[]> {
    try {
      let companies_results: CrmCompany[] = [];
      for (let i = 0; i < data.length; i++) {
        const company = data[i];
        const originId = company.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingCompany = await this.prisma.crm_companies.findFirst({
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
            remote_id: originId,
            id_connection: connection_id,
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
