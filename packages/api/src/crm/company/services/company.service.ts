import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject, Industry } from '@crm/@lib/@types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICompanyService } from '../types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
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
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(CompanyService.name);
  }

  async addCompany(
    unifiedCompanyData: UnifiedCrmCompanyInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmCompanyOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateUserId(unifiedCompanyData.user_id);

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmCompanyInput>({
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

      const unifiedObject = (await this.coreUnification.unify<
        OriginalCompanyOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.company,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedCrmCompanyOutput[];

      const source_company = resp.data;
      const target_company = unifiedObject[0];

      const unique_crm_company_id = await this.saveOrUpdateCompany(
        target_company,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_crm_company_id,
        source_company,
      );

      const result_company = await this.getCompany(
        unique_crm_company_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.company.push',
          method: 'POST',
          url: '/crm/companies',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
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

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async validateUserId(userId?: string) {
    if (userId) {
      const user = await this.prisma.crm_users.findUnique({
        where: { id_crm_user: userId },
      });
      if (!user)
        throw new ReferenceError('You inserted a user_id which does not exist');
    }
  }

  async saveOrUpdateCompany(
    company: UnifiedCrmCompanyOutput,
    connection_id: string,
  ): Promise<string> {
    const existingCompany = await this.prisma.crm_companies.findFirst({
      where: { remote_id: company.remote_id, id_connection: connection_id },
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

    const data: any = {
      name: company.name,
      industry: company.industry,
      number_of_employees: company.number_of_employees,
      id_crm_user: company.user_id,
      modified_at: new Date(),
    };

    if (existingCompany) {
      const res = await this.prisma.crm_companies.update({
        where: { id_crm_company: existingCompany.id_crm_company },
        data: data,
      });

      await this.updateRelatedEntities(
        normalizedEmails,
        normalizedPhones,
        normalizedAddresses,
        existingCompany.id_crm_company,
        connection_id,
        existingCompany,
      );

      return res.id_crm_company;
    } else {
      data.created_at = new Date();
      data.remote_id = company.remote_id;
      data.id_connection = connection_id;
      data.id_crm_company = uuidv4();

      const newCompany = await this.prisma.crm_companies.create({ data: data });

      await this.createRelatedEntities(
        normalizedEmails,
        normalizedPhones,
        normalizedAddresses,
        newCompany.id_crm_company,
        connection_id,
      );

      return newCompany.id_crm_company;
    }
  }

  async updateRelatedEntities(
    normalizedEmails: any[],
    normalizedPhones: any[],
    normalizedAddresses: any[],
    companyId: string,
    connectionId: string,
    existingCompany: any,
  ) {
    if (normalizedEmails && normalizedEmails.length > 0) {
      await Promise.all(
        normalizedEmails.map((email, index) => {
          if (existingCompany.crm_email_addresses[index]) {
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
                id_crm_company: companyId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }

    if (normalizedPhones && normalizedPhones.length > 0) {
      await Promise.all(
        normalizedPhones.map((phone, index) => {
          if (existingCompany.crm_phone_numbers[index]) {
            return this.prisma.crm_phone_numbers.update({
              where: {
                id_crm_phone_number:
                  existingCompany.crm_phone_numbers[index].id_crm_phone_number,
              },
              data: phone,
            });
          } else {
            return this.prisma.crm_phone_numbers.create({
              data: {
                ...phone,
                id_crm_company: companyId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }

    if (normalizedAddresses && normalizedAddresses.length > 0) {
      await Promise.all(
        normalizedAddresses.map((addy, index) => {
          if (existingCompany.crm_addresses[index]) {
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
                id_crm_company: companyId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }
  }

  async createRelatedEntities(
    normalizedEmails: any[],
    normalizedPhones: any[],
    normalizedAddresses: any[],
    companyId: string,
    connectionId: string,
  ) {
    if (normalizedEmails && normalizedEmails.length > 0) {
      await Promise.all(
        normalizedEmails.map((email) =>
          this.prisma.crm_email_addresses.create({
            data: {
              ...email,
              id_crm_company: companyId,
              id_connection: connectionId,
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
              id_crm_company: companyId,
              id_connection: connectionId,
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
              id_crm_company: companyId,
              id_connection: connectionId,
            },
          }),
        ),
      );
    }
  }

  async getCompany(
    id_company: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmCompanyOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);
      // Transform to UnifiedCrmCompanyOutput format
      const unifiedCompany: UnifiedCrmCompanyOutput = {
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
        remote_id: company.remote_id,
        created_at: company.created_at,
        modified_at: company.modified_at,
      };

      let res: UnifiedCrmCompanyOutput = {
        ...unifiedCompany,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: company.id_crm_company,
          },
        });
        const remote_data = JSON.parse(resp.data);

        if (resp && resp.data) {
          res = {
            ...res,
            remote_data: remote_data,
          };
        }
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'crm.company.pull',
            method: 'GET',
            url: '/crm/company',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getCompanies(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmCompanyOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_companies.findFirst({
          where: {
            id_connection: connection_id,
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
          id_connection: connection_id,
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

      const unifiedCompanies: UnifiedCrmCompanyOutput[] = await Promise.all(
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
          // Convert the map to an object
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmCompanyOutput format
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
            remote_id: company.remote_id,
            created_at: company.created_at,
            modified_at: company.modified_at,
          };
        }),
      );

      let res: UnifiedCrmCompanyOutput[] = unifiedCompanies;

      if (remote_data) {
        const remote_array_data: UnifiedCrmCompanyOutput[] = await Promise.all(
          res.map(async (company) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: company.id,
              },
            });
            if (resp && resp.data) {
              const remote_data = JSON.parse(resp.data);
              return { ...company, remote_data };
            }
            return company;
          }),
        );
        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
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
}
