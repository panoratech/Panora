import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '../types/model.unified';
import { CrmObject } from '@crm/@lib/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { ICompanyService } from '../types';
import { Utils } from '@crm/@lib/@utils';
import { throwTypedError, UnifiedCrmError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(CompanyService.name);
  }

  async batchAddCompanies(
    unifiedCompanyData: UnifiedCompanyInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedCompanyData.map((unifiedData) =>
          this.addCompany(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throw error;
    }
  }

  async addCompany(
    unifiedCompanyData: UnifiedCompanyInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      //CHECKS
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');

      const user = unifiedCompanyData.user_id;
      //check if user_id refer to real uuids
      if (user) {
        const search = await this.prisma.crm_users.findUnique({
          where: {
            id_crm_user: user,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a user_id which does not exist',
          );
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCompanyInput>({
          sourceObject: unifiedCompanyData,
          targetType: CrmObject.company,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      const service: ICompanyService =
        this.serviceRegistry.getService(integrationId);

      const resp: ApiResponse<OriginalCompanyOutput> = await service.addCompany(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalCompanyOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.company,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings: [],
      })) as UnifiedCompanyOutput[];

      // add the company inside our db
      const source_company = resp.data;
      const target_company = unifiedObject[0];

      const existingCompany = await this.prisma.crm_companies.findFirst({
        where: {
          remote_id: target_company.remote_id,
          remote_platform: integrationId,
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
          target_company.email_addresses,
          target_company.phone_numbers,
        );

      const normalizedAddresses = this.utils.normalizeAddresses(
        target_company.addresses,
      );

      let unique_crm_company_id: string;

      if (existingCompany) {
        // Update the existing company
        let data: any = {
          modified_at: new Date(),
        };
        if (target_company.name) {
          data = { ...data, name: target_company.name };
        }
        if (target_company.industry) {
          data = { ...data, industry: target_company.industry };
        }
        if (target_company.number_of_employees) {
          data = {
            ...data,
            number_of_employees: target_company.number_of_employees,
          };
        }
        if (target_company.user_id) {
          data = { ...data, id_crm_user: target_company.user_id };
        }

        const res = await this.prisma.crm_companies.update({
          where: {
            id_crm_company: existingCompany.id_crm_company,
          },
          data: data,
        });

        this.logger.log(
          'NORMALIZED EMAILS ARE => ' + JSON.stringify(normalizedEmails),
        );

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
              if (existingCompany && existingCompany.crm_phone_numbers[index]) {
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
                    id_crm_company: existingCompany.id_crm_company, // Assuming 'uuid' is the ID of the related contact
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
      } else {
        // Create a new company
        // this.logger.log('company not exists');
        const uuid = uuidv4();
        let data: any = {
          id_crm_company: uuid,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_company.remote_id,
          remote_platform: integrationId,
        };

        if (target_company.name) {
          data = { ...data, name: target_company.name };
        }
        if (target_company.industry) {
          data = { ...data, industry: target_company.industry };
        }
        if (target_company.number_of_employees) {
          data = {
            ...data,
            number_of_employees: target_company.number_of_employees,
          };
        }
        if (target_company.user_id) {
          data = { ...data, id_crm_user: target_company.user_id };
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
          data: JSON.stringify(source_company),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_company),
          created_at: new Date(),
        },
      });

      const result_company = await this.getCompany(
        unique_crm_company_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.company.push', //sync, push or pull
          method: 'POST',
          url: '/crm/companies',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        result_company,
        'crm.company.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_company;
    } catch (error) {
      throw error;
    }
  }

  async getCompany(
    id_company: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput> {
    try {
      const company = await this.prisma.crm_companies.findUnique({
        where: {
          id_crm_company: id_company,
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
          crm_addresses: true,
        },
      });

      // Fetch field mappings for the company
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: company.id_crm_company,
          },
        },
        include: {
          attribute: true,
        },
      });

      //Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));
      // Transform to UnifiedCompanyOutput format
      const unifiedCompany: UnifiedCompanyOutput = {
        id: company.id_crm_company,
        name: company.name,
        industry: company.industry,
        number_of_employees: Number(company.number_of_employees),
        user_id: company.id_crm_user, // uuid of User object
        field_mappings: field_mappings,
        email_addresses: company.crm_email_addresses.map((email) => ({
          email_address: email.email_address,
          email_address_type: email.email_address_type,
        })),
        phone_numbers: company.crm_phone_numbers.map((phone) => ({
          phone_number: phone.phone_number,
          phone_type: phone.phone_type,
        })),
        addresses: company.crm_addresses.map((addy) => ({
          ...addy,
        })),
      };

      let res: UnifiedCompanyOutput = {
        ...unifiedCompany,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: company.id_crm_company,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getCompanies(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCompanyOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_companies.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_crm_company: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const companies = await this.prisma.crm_companies.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_company: cursor,
            }
          : undefined,
        orderBy: {
          modified_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
          crm_addresses: true,
        },
      });

      if (companies.length === limit + 1) {
        next_cursor = Buffer.from(
          companies[companies.length - 1].id_crm_company,
        ).toString('base64');
        companies.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedCompanies: UnifiedCompanyOutput[] = await Promise.all(
        companies.map(async (company) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: company.id_crm_company,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedCompanyOutput format
          return {
            id: company.id_crm_company,
            name: company.name,
            industry: company.industry,
            number_of_employees: Number(company.number_of_employees),
            user_id: company.id_crm_user, // uuid of User object
            field_mappings: field_mappings,
            email_addresses: company.crm_email_addresses.map((email) => ({
              email_address: email.email_address,
              email_address_type: email.email_address_type,
            })),
            phone_numbers: company.crm_phone_numbers.map((phone) => ({
              phone_number: phone.phone_number,
              phone_type: phone.phone_type,
            })),
            addresses: company.crm_addresses.map((addy) => ({
              ...addy,
            })),
          };
        }),
      );

      let res: UnifiedCompanyOutput[] = unifiedCompanies;

      if (remote_data) {
        const remote_array_data: UnifiedCompanyOutput[] = await Promise.all(
          res.map(async (company) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: company.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...company, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.company.pulled',
          method: 'GET',
          url: '/crm/companies',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }

  //TODO
  async updateCompany(
    id_company: string,
    data: Partial<UnifiedCompanyInput>,
  ): Promise<UnifiedCompanyOutput> {
    return;
  }
}
