import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingCompanyinfoInput,
  UnifiedAccountingCompanyinfoOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CompanyInfoService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CompanyInfoService.name);
  }

  async getCompanyInfo(
    id_acc_company_info: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingCompanyinfoOutput> {
    try {
      const companyInfo = await this.prisma.acc_company_infos.findUnique({
        where: { id_acc_company_info: id_acc_company_info },
      });

      if (!companyInfo) {
        throw new Error(
          `Company info with ID ${id_acc_company_info} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: companyInfo.id_acc_company_info },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedCompanyInfo: UnifiedAccountingCompanyinfoOutput = {
        id: companyInfo.id_acc_company_info,
        name: companyInfo.name,
        legal_name: companyInfo.legal_name,
        tax_number: companyInfo.tax_number,
        fiscal_year_end_month: companyInfo.fiscal_year_end_month,
        fiscal_year_end_day: companyInfo.fiscal_year_end_day,
        currency: companyInfo.currency as CurrencyCode,
        urls: companyInfo.urls,
        tracking_categories: companyInfo.tracking_categories,
        field_mappings: field_mappings,
        remote_id: companyInfo.remote_id,
        remote_created_at: companyInfo.remote_created_at,
        created_at: companyInfo.created_at,
        modified_at: companyInfo.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: companyInfo.id_acc_company_info },
        });
        unifiedCompanyInfo.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.company_info.pull',
          method: 'GET',
          url: '/accounting/company_info',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedCompanyInfo;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyInfos(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingCompanyinfoOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const companyInfos = await this.prisma.acc_company_infos.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_company_info: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = companyInfos.length > limit;
      if (hasNextPage) companyInfos.pop();

      const unifiedCompanyInfos = await Promise.all(
        companyInfos.map(async (companyInfo) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: companyInfo.id_acc_company_info },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedCompanyInfo: UnifiedAccountingCompanyinfoOutput = {
            id: companyInfo.id_acc_company_info,
            name: companyInfo.name,
            legal_name: companyInfo.legal_name,
            tax_number: companyInfo.tax_number,
            fiscal_year_end_month: companyInfo.fiscal_year_end_month,
            fiscal_year_end_day: companyInfo.fiscal_year_end_day,
            currency: companyInfo.currency as CurrencyCode,
            urls: companyInfo.urls,
            tracking_categories: companyInfo.tracking_categories,
            field_mappings: field_mappings,
            remote_id: companyInfo.remote_id,
            remote_created_at: companyInfo.remote_created_at,
            created_at: companyInfo.created_at,
            modified_at: companyInfo.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: companyInfo.id_acc_company_info },
            });
            unifiedCompanyInfo.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedCompanyInfo;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.company_info.pull',
          method: 'GET',
          url: '/accounting/company_infos',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedCompanyInfos,
        next_cursor: hasNextPage
          ? companyInfos[companyInfos.length - 1].id_acc_company_info
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
