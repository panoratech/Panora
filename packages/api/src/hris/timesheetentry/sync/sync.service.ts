import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalTimesheetentryOutput } from '@@core/utils/types/original/original.hris';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_timesheet_entries as HrisTimesheetEntry } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITimesheetentryService } from '../types';
import { UnifiedHrisTimesheetEntryOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('hris', 'timesheetentry', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = HRIS_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ITimesheetentryService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisTimesheetEntryOutput,
        OriginalTimesheetentryOutput,
        ITimesheetentryService
      >(integrationId, linkedUserId, 'hris', 'timesheetentry', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    timesheetEntries: UnifiedHrisTimesheetEntryOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisTimesheetEntry[]> {
    try {
      const timesheetEntryResults: HrisTimesheetEntry[] = [];

      for (let i = 0; i < timesheetEntries.length; i++) {
        const timesheetEntry = timesheetEntries[i];
        const originId = timesheetEntry.remote_id;

        let existingTimesheetEntry =
          await this.prisma.hris_timesheet_entries.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const timesheetEntryData = {
          hours_worked: timesheetEntry.hours_worked
            ? BigInt(timesheetEntry.hours_worked)
            : null,
          start_time: timesheetEntry.start_time
            ? new Date(timesheetEntry.start_time)
            : null,
          end_time: timesheetEntry.end_time
            ? new Date(timesheetEntry.end_time)
            : null,
          id_hris_employee: timesheetEntry.employee_id,
          remote_id: originId,
          remote_created_at: timesheetEntry.remote_created_at
            ? new Date(timesheetEntry.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: timesheetEntry.remote_was_deleted || false,
        };

        if (existingTimesheetEntry) {
          existingTimesheetEntry =
            await this.prisma.hris_timesheet_entries.update({
              where: {
                id_hris_timesheet_entry:
                  existingTimesheetEntry.id_hris_timesheet_entry,
              },
              data: timesheetEntryData,
            });
        } else {
          existingTimesheetEntry =
            await this.prisma.hris_timesheet_entries.create({
              data: {
                ...timesheetEntryData,
                id_hris_timesheet_entry: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        timesheetEntryResults.push(existingTimesheetEntry);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          timesheetEntry.field_mappings,
          existingTimesheetEntry.id_hris_timesheet_entry,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingTimesheetEntry.id_hris_timesheet_entry,
          remote_data[i],
        );
      }

      return timesheetEntryResults;
    } catch (error) {
      throw error;
    }
  }
}
