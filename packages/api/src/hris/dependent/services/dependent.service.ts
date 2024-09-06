import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisDependentOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class DependentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DependentService.name);
  }

  async getDependent(
    id_hris_dependent: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisDependentOutput> {
    try {
      const dependent = await this.prisma.hris_dependents.findUnique({
        where: { id_hris_dependents: id_hris_dependent },
      });

      if (!dependent) {
        throw new Error(`Dependent with ID ${id_hris_dependent} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: dependent.id_hris_dependents },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedDependent: UnifiedHrisDependentOutput = {
        id: dependent.id_hris_dependents,
        first_name: dependent.first_name,
        last_name: dependent.last_name,
        middle_name: dependent.middle_name,
        relationship: dependent.relationship,
        date_of_birth: dependent.date_of_birth,
        gender: dependent.gender,
        phone_number: dependent.phone_number,
        home_location: dependent.home_location,
        is_student: dependent.is_student,
        ssn: dependent.ssn,
        employee_id: dependent.id_hris_employee,
        field_mappings: field_mappings,
        remote_id: dependent.remote_id,
        remote_created_at: dependent.remote_created_at,
        created_at: dependent.created_at,
        modified_at: dependent.modified_at,
        remote_was_deleted: dependent.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: dependent.id_hris_dependents },
        });
        unifiedDependent.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.dependent.pull',
          method: 'GET',
          url: '/hris/dependent',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedDependent;
    } catch (error) {
      throw error;
    }
  }

  async getDependents(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisDependentOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const dependents = await this.prisma.hris_dependents.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_dependents: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = dependents.length > limit;
      if (hasNextPage) dependents.pop();

      const unifiedDependents = await Promise.all(
        dependents.map(async (dependent) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: dependent.id_hris_dependents },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedDependent: UnifiedHrisDependentOutput = {
            id: dependent.id_hris_dependents,
            first_name: dependent.first_name,
            last_name: dependent.last_name,
            middle_name: dependent.middle_name,
            relationship: dependent.relationship,
            date_of_birth: dependent.date_of_birth,
            gender: dependent.gender,
            phone_number: dependent.phone_number,
            home_location: dependent.home_location,
            is_student: dependent.is_student,
            ssn: dependent.ssn,
            employee_id: dependent.id_hris_employee,
            field_mappings: field_mappings,
            remote_id: dependent.remote_id,
            remote_created_at: dependent.remote_created_at,
            created_at: dependent.created_at,
            modified_at: dependent.modified_at,
            remote_was_deleted: dependent.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: dependent.id_hris_dependents },
            });
            unifiedDependent.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedDependent;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.dependent.pull',
          method: 'GET',
          url: '/hris/dependents',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedDependents,
        next_cursor: hasNextPage
          ? dependents[dependents.length - 1].id_hris_dependents
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
