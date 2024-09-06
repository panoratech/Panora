import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisEmployerbenefitInput,
  UnifiedHrisEmployerbenefitOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class EmployerBenefitService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployerBenefitService.name);
  }

  async getEmployerBenefit(
    id_hris_employer_benefit: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmployerbenefitOutput> {
    try {
      const employerBenefit =
        await this.prisma.hris_employer_benefits.findUnique({
          where: { id_hris_employer_benefit: id_hris_employer_benefit },
        });

      if (!employerBenefit) {
        throw new Error(
          `Employer Benefit with ID ${id_hris_employer_benefit} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: employerBenefit.id_hris_employer_benefit,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedEmployerBenefit: UnifiedHrisEmployerbenefitOutput = {
        id: employerBenefit.id_hris_employer_benefit,
        benefit_plan_type: employerBenefit.benefit_plan_type,
        name: employerBenefit.name,
        description: employerBenefit.description,
        deduction_code: employerBenefit.deduction_code,
        field_mappings: field_mappings,
        remote_id: employerBenefit.remote_id,
        remote_created_at: employerBenefit.remote_created_at,
        created_at: employerBenefit.created_at,
        modified_at: employerBenefit.modified_at,
        remote_was_deleted: employerBenefit.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: employerBenefit.id_hris_employer_benefit,
          },
        });
        unifiedEmployerBenefit.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employer_benefit.pull',
          method: 'GET',
          url: '/hris/employer_benefit',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedEmployerBenefit;
    } catch (error) {
      throw error;
    }
  }

  async getEmployerBenefits(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisEmployerbenefitOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const employerBenefits =
        await this.prisma.hris_employer_benefits.findMany({
          take: limit + 1,
          cursor: cursor ? { id_hris_employer_benefit: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        });

      const hasNextPage = employerBenefits.length > limit;
      if (hasNextPage) employerBenefits.pop();

      const unifiedEmployerBenefits = await Promise.all(
        employerBenefits.map(async (employerBenefit) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: employerBenefit.id_hris_employer_benefit,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedEmployerBenefit: UnifiedHrisEmployerbenefitOutput = {
            id: employerBenefit.id_hris_employer_benefit,
            benefit_plan_type: employerBenefit.benefit_plan_type,
            name: employerBenefit.name,
            description: employerBenefit.description,
            deduction_code: employerBenefit.deduction_code,
            field_mappings: field_mappings,
            remote_id: employerBenefit.remote_id,
            remote_created_at: employerBenefit.remote_created_at,
            created_at: employerBenefit.created_at,
            modified_at: employerBenefit.modified_at,
            remote_was_deleted: employerBenefit.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: employerBenefit.id_hris_employer_benefit,
              },
            });
            unifiedEmployerBenefit.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedEmployerBenefit;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employer_benefit.pull',
          method: 'GET',
          url: '/hris/employer_benefits',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedEmployerBenefits,
        next_cursor: hasNextPage
          ? employerBenefits[employerBenefits.length - 1]
              .id_hris_employer_benefit
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
