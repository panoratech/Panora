import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisEmploymentOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class EmploymentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmploymentService.name);
  }

  async getEmployment(
    id_hris_employment: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmploymentOutput> {
    try {
      const employment = await this.prisma.hris_employments.findUnique({
        where: { id_hris_employment: id_hris_employment },
      });

      if (!employment) {
        throw new Error(`Employment with ID ${id_hris_employment} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: employment.id_hris_employment,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedEmployment: UnifiedHrisEmploymentOutput = {
        id: employment.id_hris_employment,
        job_title: employment.job_title,
        pay_rate: Number(employment.pay_rate),
        pay_period: employment.pay_period,
        pay_frequency: employment.pay_frequency,
        pay_currency: employment.pay_currency,
        flsa_status: employment.flsa_status,
        effective_date: employment.effective_date,
        employment_type: employment.employment_type,
        field_mappings: field_mappings,
        remote_id: employment.remote_id,
        remote_created_at: employment.remote_created_at,
        created_at: employment.created_at,
        modified_at: employment.modified_at,
        remote_was_deleted: employment.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: employment.id_hris_employment,
          },
        });
        unifiedEmployment.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employment.pull',
          method: 'GET',
          url: '/hris/employment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedEmployment;
    } catch (error) {
      throw error;
    }
  }

  async getEmployments(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisEmploymentOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const employments = await this.prisma.hris_employments.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_employment: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = employments.length > limit;
      if (hasNextPage) employments.pop();

      const unifiedEmployments = await Promise.all(
        employments.map(async (employment) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: employment.id_hris_employment,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedEmployment: UnifiedHrisEmploymentOutput = {
            id: employment.id_hris_employment,
            job_title: employment.job_title,
            pay_rate: Number(employment.pay_rate),
            pay_period: employment.pay_period,
            pay_frequency: employment.pay_frequency,
            pay_currency: employment.pay_currency,
            flsa_status: employment.flsa_status,
            effective_date: employment.effective_date,
            employment_type: employment.employment_type,
            field_mappings: field_mappings,
            remote_id: employment.remote_id,
            remote_created_at: employment.remote_created_at,
            created_at: employment.created_at,
            modified_at: employment.modified_at,
            remote_was_deleted: employment.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: employment.id_hris_employment,
              },
            });
            unifiedEmployment.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedEmployment;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employment.pull',
          method: 'GET',
          url: '/hris/employments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedEmployments,
        next_cursor: hasNextPage
          ? employments[employments.length - 1].id_hris_employment
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
