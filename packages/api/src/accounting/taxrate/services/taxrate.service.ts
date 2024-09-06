import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingTaxrateOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TaxRateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TaxRateService.name);
  }

  async getTaxRate(
    id_acc_tax_rate: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingTaxrateOutput> {
    try {
      const taxRate = await this.prisma.acc_tax_rates.findUnique({
        where: { id_acc_tax_rate: id_acc_tax_rate },
      });

      if (!taxRate) {
        throw new Error(`Tax rate with ID ${id_acc_tax_rate} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: taxRate.id_acc_tax_rate },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTaxRate: UnifiedAccountingTaxrateOutput = {
        id: taxRate.id_acc_tax_rate,
        description: taxRate.description,
        total_tax_ratge: taxRate.total_tax_ratge
          ? Number(taxRate.total_tax_ratge)
          : undefined,
        effective_tax_rate: taxRate.effective_tax_rate
          ? Number(taxRate.effective_tax_rate)
          : undefined,
        company_id: taxRate.company,
        field_mappings: field_mappings,
        remote_id: taxRate.remote_id,
        created_at: taxRate.created_at,
        modified_at: taxRate.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: taxRate.id_acc_tax_rate },
        });
        unifiedTaxRate.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.tax_rate.pull',
          method: 'GET',
          url: '/accounting/tax_rate',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTaxRate;
    } catch (error) {
      throw error;
    }
  }

  async getTaxRates(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingTaxrateOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const taxRates = await this.prisma.acc_tax_rates.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_tax_rate: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = taxRates.length > limit;
      if (hasNextPage) taxRates.pop();

      const unifiedTaxRates = await Promise.all(
        taxRates.map(async (taxRate) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: taxRate.id_acc_tax_rate },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTaxRate: UnifiedAccountingTaxrateOutput = {
            id: taxRate.id_acc_tax_rate,
            description: taxRate.description,
            total_tax_ratge: taxRate.total_tax_ratge
              ? Number(taxRate.total_tax_ratge)
              : undefined,
            effective_tax_rate: taxRate.effective_tax_rate
              ? Number(taxRate.effective_tax_rate)
              : undefined,
            company_id: taxRate.company,
            field_mappings: field_mappings,
            remote_id: taxRate.remote_id,
            created_at: taxRate.created_at,
            modified_at: taxRate.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: taxRate.id_acc_tax_rate },
            });
            unifiedTaxRate.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTaxRate;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.tax_rate.pull',
          method: 'GET',
          url: '/accounting/tax_rates',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTaxRates,
        next_cursor: hasNextPage
          ? taxRates[taxRates.length - 1].id_acc_tax_rate
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
