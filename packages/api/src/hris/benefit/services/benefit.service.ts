import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisBenefitOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class BenefitService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BenefitService.name);
  }

  async getBenefit(
    id_hris_benefit: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisBenefitOutput> {
    try {
      const benefit = await this.prisma.hris_benefits.findUnique({
        where: { id_hris_benefit: id_hris_benefit },
      });

      if (!benefit) {
        throw new Error(`Benefit with ID ${id_hris_benefit} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: benefit.id_hris_benefit },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedBenefit: UnifiedHrisBenefitOutput = {
        id: benefit.id_hris_benefit,
        provider_name: benefit.provider_name,
        employee_id: benefit.id_hris_employee,
        employee_contribution: Number(benefit.employee_contribution),
        company_contribution: Number(benefit.company_contribution),
        start_date: benefit.start_date,
        end_date: benefit.end_date,
        employer_benefit_id: benefit.id_hris_employer_benefit,
        field_mappings: field_mappings,
        remote_id: benefit.remote_id,
        remote_created_at: benefit.remote_created_at,
        created_at: benefit.created_at,
        modified_at: benefit.modified_at,
        remote_was_deleted: benefit.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: benefit.id_hris_benefit },
        });
        unifiedBenefit.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.benefit.pull',
          method: 'GET',
          url: '/hris/benefit',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedBenefit;
    } catch (error) {
      throw error;
    }
  }

  async getBenefits(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisBenefitOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const benefits = await this.prisma.hris_benefits.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_benefit: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = benefits.length > limit;
      if (hasNextPage) benefits.pop();

      const unifiedBenefits = await Promise.all(
        benefits.map(async (benefit) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: benefit.id_hris_benefit },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedBenefit: UnifiedHrisBenefitOutput = {
            id: benefit.id_hris_benefit,
            provider_name: benefit.provider_name,
            employee_id: benefit.id_hris_employee,
            employee_contribution: Number(benefit.employee_contribution),
            company_contribution: Number(benefit.company_contribution),
            start_date: benefit.start_date,
            end_date: benefit.end_date,
            employer_benefit_id: benefit.id_hris_employer_benefit,
            field_mappings: field_mappings,
            remote_id: benefit.remote_id,
            remote_created_at: benefit.remote_created_at,
            created_at: benefit.created_at,
            modified_at: benefit.modified_at,
            remote_was_deleted: benefit.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: benefit.id_hris_benefit },
            });
            unifiedBenefit.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedBenefit;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.benefit.pull',
          method: 'GET',
          url: '/hris/benefits',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedBenefits,
        next_cursor: hasNextPage
          ? benefits[benefits.length - 1].id_hris_benefit
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
