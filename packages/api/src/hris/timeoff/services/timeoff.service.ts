import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisTimeoffInput,
  UnifiedHrisTimeoffOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TimeoffService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimeoffService.name);
  }

  async addTimeoff(
    unifiedTimeoffData: UnifiedHrisTimeoffInput,
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimeoffOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addTimeoff(unifiedTimeoffData, linkedUserId);

      const savedTimeOff = await this.prisma.hris_time_off.create({
        data: {
          id_hris_time_off: uuidv4(),
          ...unifiedTimeoffData,
          amount: unifiedTimeoffData.amount
            ? BigInt(unifiedTimeoffData.amount)
            : null,
          start_time: unifiedTimeoffData.start_time
            ? new Date(unifiedTimeoffData.start_time)
            : null,
          end_time: unifiedTimeoffData.end_time
            ? new Date(unifiedTimeoffData.end_time)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: connectionId,
          created_at: new Date(),
          modified_at: new Date(),
          remote_created_at: resp.data.remote_created_at
            ? new Date(resp.data.remote_created_at)
            : null,
          remote_was_deleted: false,
        },
      });

      const result: UnifiedHrisTimeoffOutput = {
        ...savedTimeOff,
        id: savedTimeOff.id_hris_time_off,
        amount: Number(savedTimeOff.amount),
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getTimeoff(
    id_hris_time_off: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimeoffOutput> {
    try {
      const timeOff = await this.prisma.hris_time_off.findUnique({
        where: { id_hris_time_off: id_hris_time_off },
      });

      if (!timeOff) {
        throw new Error(`Time off with ID ${id_hris_time_off} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: timeOff.id_hris_time_off },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTimeOff: UnifiedHrisTimeoffOutput = {
        id: timeOff.id_hris_time_off,
        employee: timeOff.employee,
        approver: timeOff.approver,
        status: timeOff.status,
        employee_note: timeOff.employee_note,
        units: timeOff.units,
        amount: timeOff.amount ? Number(timeOff.amount) : undefined,
        request_type: timeOff.request_type,
        start_time: timeOff.start_time,
        end_time: timeOff.end_time,
        field_mappings: field_mappings,
        remote_id: timeOff.remote_id,
        remote_created_at: timeOff.remote_created_at,
        created_at: timeOff.created_at,
        modified_at: timeOff.modified_at,
        remote_was_deleted: timeOff.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: timeOff.id_hris_time_off },
        });
        unifiedTimeOff.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.time_off.pull',
          method: 'GET',
          url: '/hris/time_off',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTimeOff;
    } catch (error) {
      throw error;
    }
  }

  async getTimeoffs(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisTimeoffOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const timeOffs = await this.prisma.hris_time_off.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_time_off: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = timeOffs.length > limit;
      if (hasNextPage) timeOffs.pop();

      const unifiedTimeOffs = await Promise.all(
        timeOffs.map(async (timeOff) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: timeOff.id_hris_time_off },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTimeOff: UnifiedHrisTimeoffOutput = {
            id: timeOff.id_hris_time_off,
            employee: timeOff.employee,
            approver: timeOff.approver,
            status: timeOff.status,
            employee_note: timeOff.employee_note,
            units: timeOff.units,
            amount: timeOff.amount ? Number(timeOff.amount) : undefined,
            request_type: timeOff.request_type,
            start_time: timeOff.start_time,
            end_time: timeOff.end_time,
            field_mappings: field_mappings,
            remote_id: timeOff.remote_id,
            remote_created_at: timeOff.remote_created_at,
            created_at: timeOff.created_at,
            modified_at: timeOff.modified_at,
            remote_was_deleted: timeOff.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: timeOff.id_hris_time_off,
              },
            });
            unifiedTimeOff.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTimeOff;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.timeoff.pull',
          method: 'GET',
          url: '/hris/timeoffs',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTimeOffs,
        next_cursor: hasNextPage
          ? timeOffs[timeOffs.length - 1].id_hris_time_off
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
