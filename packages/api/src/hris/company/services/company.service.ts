import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisCompanyOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CompanyService.name);
  }

  async getCompany(
    id_hris_company: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisCompanyOutput> {
    try {
      const company = await this.prisma.hris_companies.findUnique({
        where: { id_hris_company: id_hris_company },
      });

      if (!company) {
        throw new Error(`Company with ID ${id_hris_company} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: company.id_hris_company },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const locations = await this.prisma.hris_locations.findMany({
        where: {
          id_hris_company: company.id_hris_company,
        },
      });

      const unifiedCompany: UnifiedHrisCompanyOutput = {
        id: company.id_hris_company,
        legal_name: company.legal_name,
        display_name: company.display_name,
        eins: company.eins,
        field_mappings: field_mappings,
        locations: locations.map((loc) => loc.id_hris_location),
        remote_id: company.remote_id,
        remote_created_at: company.remote_created_at,
        created_at: company.created_at,
        modified_at: company.modified_at,
        remote_was_deleted: company.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: company.id_hris_company },
        });
        unifiedCompany.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.company.pull',
          method: 'GET',
          url: '/hris/company',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedCompany;
    } catch (error) {
      throw error;
    }
  }

  async getCompanies(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisCompanyOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const companies = await this.prisma.hris_companies.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_company: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = companies.length > limit;
      if (hasNextPage) companies.pop();

      const unifiedCompanies = await Promise.all(
        companies.map(async (company) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: company.id_hris_company },
            },
            include: { attribute: true },
          });

          const locations = await this.prisma.hris_locations.findMany({
            where: {
              id_hris_company: company.id_hris_company,
            },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedCompany: UnifiedHrisCompanyOutput = {
            id: company.id_hris_company,
            legal_name: company.legal_name,
            display_name: company.display_name,
            eins: company.eins,
            field_mappings: field_mappings,
            locations: locations.map((loc) => loc.id_hris_location),
            remote_id: company.remote_id,
            remote_created_at: company.remote_created_at,
            created_at: company.created_at,
            modified_at: company.modified_at,
            remote_was_deleted: company.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: company.id_hris_company },
            });
            unifiedCompany.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedCompany;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.company.pull',
          method: 'GET',
          url: '/hris/companies',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedCompanies,
        next_cursor: hasNextPage
          ? companies[companies.length - 1].id_hris_company
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
