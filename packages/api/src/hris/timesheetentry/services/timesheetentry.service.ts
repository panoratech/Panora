import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisTimesheetEntryInput,
  UnifiedHrisTimesheetEntryOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TimesheetentryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimesheetentryService.name);
  }

  async addTimesheetentry(
    unifiedTimesheetentryData: UnifiedHrisTimesheetEntryInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimesheetEntryOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addTimesheetentry(
        unifiedTimesheetentryData,
        linkedUserId,
      );

      const savedTimesheetEntry =
        await this.prisma.hris_timesheet_entries.create({
          data: {
            id_hris_timesheet_entry: uuidv4(),
            ...unifiedTimesheetentryData,
            hours_worked: unifiedTimesheetentryData.hours_worked
              ? BigInt(unifiedTimesheetentryData.hours_worked)
              : null,
            start_time: unifiedTimesheetentryData.start_time
              ? new Date(unifiedTimesheetentryData.start_time)
              : null,
            end_time: unifiedTimesheetentryData.end_time
              ? new Date(unifiedTimesheetentryData.end_time)
              : null,
            remote_id: resp.data.remote_id,
            id_connection: connection_id,
            created_at: new Date(),
            modified_at: new Date(),
            remote_created_at: resp.data.remote_created_at
              ? new Date(resp.data.remote_created_at)
              : null,
            remote_was_deleted: false,
          },
        });

      const result: UnifiedHrisTimesheetEntryOutput = {
        ...savedTimesheetEntry,
        id: savedTimesheetEntry.id_hris_timesheet_entry,
        hours_worked: Number(savedTimesheetEntry.hours_worked),
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getTimesheetentry(
    id_hris_timesheet_entry: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimesheetEntryOutput> {
    try {
      const timesheetEntry =
        await this.prisma.hris_timesheet_entries.findUnique({
          where: { id_hris_timesheet_entry: id_hris_timesheet_entry },
        });

      if (!timesheetEntry) {
        throw new Error(
          `Timesheet entry with ID ${id_hris_timesheet_entry} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: timesheetEntry.id_hris_timesheet_entry,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTimesheetEntry: UnifiedHrisTimesheetEntryOutput = {
        id: timesheetEntry.id_hris_timesheet_entry,
        hours_worked: timesheetEntry.hours_worked
          ? Number(timesheetEntry.hours_worked)
          : undefined,
        start_time: timesheetEntry.start_time,
        end_time: timesheetEntry.end_time,
        employee_id: timesheetEntry.id_hris_employee,
        remote_id: timesheetEntry.remote_id,
        remote_created_at: timesheetEntry.remote_created_at,
        created_at: timesheetEntry.created_at,
        modified_at: timesheetEntry.modified_at,
        remote_was_deleted: timesheetEntry.remote_was_deleted,
        field_mappings: field_mappings,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: timesheetEntry.id_hris_timesheet_entry },
        });
        unifiedTimesheetEntry.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.timesheetentry.pull',
          method: 'GET',
          url: '/hris/timesheetentry',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTimesheetEntry;
    } catch (error) {
      throw error;
    }
  }

  async getTimesheetentrys(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisTimesheetEntryOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const timesheetEntries =
        await this.prisma.hris_timesheet_entries.findMany({
          take: limit + 1,
          cursor: cursor ? { id_hris_timesheet_entry: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        });

      const hasNextPage = timesheetEntries.length > limit;
      if (hasNextPage) timesheetEntries.pop();

      const unifiedTimesheetEntries = await Promise.all(
        timesheetEntries.map(async (timesheetEntry) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: timesheetEntry.id_hris_timesheet_entry,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTimesheetEntry: UnifiedHrisTimesheetEntryOutput = {
            id: timesheetEntry.id_hris_timesheet_entry,
            hours_worked: timesheetEntry.hours_worked
              ? Number(timesheetEntry.hours_worked)
              : undefined,
            start_time: timesheetEntry.start_time,
            end_time: timesheetEntry.end_time,
            employee_id: timesheetEntry.id_hris_employee,
            remote_id: timesheetEntry.remote_id,
            remote_created_at: timesheetEntry.remote_created_at,
            created_at: timesheetEntry.created_at,
            modified_at: timesheetEntry.modified_at,
            remote_was_deleted: timesheetEntry.remote_was_deleted,
            field_mappings: field_mappings,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: timesheetEntry.id_hris_timesheet_entry,
              },
            });
            unifiedTimesheetEntry.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTimesheetEntry;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.timesheetentry.pull',
          method: 'GET',
          url: '/hris/timesheetentrys',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTimesheetEntries,
        next_cursor: hasNextPage
          ? timesheetEntries[timesheetEntries.length - 1]
              .id_hris_timesheet_entry
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
