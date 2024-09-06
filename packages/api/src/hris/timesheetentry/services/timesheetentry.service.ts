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
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { OriginalTimesheetentryOutput } from '@@core/utils/types/original/original.hris';
import { HrisObject } from '@panora/shared';
import { ITimesheetentryService } from '../types';

@Injectable()
export class TimesheetentryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimesheetentryService.name);
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async addTimesheetentry(
    unifiedTimesheetentryData: UnifiedHrisTimesheetEntryInput,
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimesheetEntryOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      // Add any necessary validations here, e.g., validateEmployeeId if needed

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedHrisTimesheetEntryInput>({
          sourceObject: unifiedTimesheetentryData,
          targetType: HrisObject.timesheetentry,
          providerName: integrationId,
          vertical: 'hris',
          customFieldMappings: [],
        });

      const service: ITimesheetentryService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTimesheetentryOutput> =
        await service.addTimesheetentry(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalTimesheetentryOutput[]
      >({
        sourceObject: [resp.data],
        targetType: HrisObject.timesheetentry,
        providerName: integrationId,
        vertical: 'hris',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedHrisTimesheetEntryOutput[];

      const source_timesheetentry = resp.data;
      const target_timesheetentry = unifiedObject[0];

      const unique_hris_timesheetentry_id =
        await this.saveOrUpdateTimesheetentry(
          target_timesheetentry,
          connectionId,
        );

      await this.ingestService.processRemoteData(
        unique_hris_timesheetentry_id,
        source_timesheetentry,
      );

      const result_timesheetentry = await this.getTimesheetentry(
        unique_hris_timesheetentry_id,
        undefined,
        undefined,
        connectionId,
        projectId,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: status_resp,
          type: 'hris.timesheetentry.push',
          method: 'POST',
          url: '/hris/timesheetentries',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_timesheetentry,
        'hris.timesheetentry.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_timesheetentry;
    } catch (error) {
      throw error;
    }
  }

  private async saveOrUpdateTimesheetentry(
    timesheetentry: UnifiedHrisTimesheetEntryOutput,
    connectionId: string,
  ): Promise<string> {
    const existingTimesheetentry =
      await this.prisma.hris_timesheet_entries.findFirst({
        where: {
          remote_id: timesheetentry.remote_id,
          id_connection: connectionId,
        },
      });

    const data: any = {
      hours_worked: timesheetentry.hours_worked
        ? BigInt(timesheetentry.hours_worked)
        : null,
      start_time: timesheetentry.start_time
        ? new Date(timesheetentry.start_time)
        : null,
      end_time: timesheetentry.end_time
        ? new Date(timesheetentry.end_time)
        : null,
      id_hris_employee: timesheetentry.employee_id,
      remote_was_deleted: timesheetentry.remote_was_deleted ?? false,
      modified_at: new Date(),
    };

    // Only include field_mappings if it exists in the input
    if (timesheetentry.field_mappings) {
      data.field_mappings = timesheetentry.field_mappings;
    }

    if (existingTimesheetentry) {
      const res = await this.prisma.hris_timesheet_entries.update({
        where: {
          id_hris_timesheet_entry:
            existingTimesheetentry.id_hris_timesheet_entry,
        },
        data: data,
      });

      return res.id_hris_timesheet_entry;
    } else {
      data.created_at = new Date();
      data.remote_id = timesheetentry.remote_id;
      data.id_connection = connectionId;
      data.id_hris_timesheet_entry = uuidv4();
      data.remote_created_at = timesheetentry.remote_created_at
        ? new Date(timesheetentry.remote_created_at)
        : null;

      const newTimesheetentry = await this.prisma.hris_timesheet_entries.create(
        { data: data },
      );

      return newTimesheetentry.id_hris_timesheet_entry;
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
