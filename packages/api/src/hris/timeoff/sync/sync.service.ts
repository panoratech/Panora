import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisTimeoffOutput } from '../types/model.unified';
import { ITimeoffService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_time_off as HrisTimeOff } from '@prisma/client';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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
    this.registry.registerService('hris', 'time_off', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */12 * * *') // every 12 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing time off...');
      const users = user_id
        ? [await this.prisma.users.findUnique({ where: { id_user: user_id } })]
        : await this.prisma.users.findMany();

      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: { id_user: user.id_user },
          });
          for (const project of projects) {
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: { id_project: project.id_project },
            });
            for (const linkedUser of linkedUsers) {
              for (const provider of HRIS_PROVIDERS) {
                await this.syncForLinkedUser({
                  integrationId: provider,
                  linkedUserId: linkedUser.id_linked_user,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ITimeoffService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisTimeoffOutput,
        OriginalTimeoffOutput,
        ITimeoffService
      >(integrationId, linkedUserId, 'hris', 'time_off', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    timeOffs: UnifiedHrisTimeoffOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisTimeOff[]> {
    try {
      const timeOffResults: HrisTimeOff[] = [];

      for (let i = 0; i < timeOffs.length; i++) {
        const timeOff = timeOffs[i];
        const originId = timeOff.remote_id;

        let existingTimeOff = await this.prisma.hris_time_off.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const timeOffData = {
          employee: timeOff.employee,
          approver: timeOff.approver,
          status: timeOff.status,
          employee_note: timeOff.employee_note,
          units: timeOff.units,
          amount: timeOff.amount ? BigInt(timeOff.amount) : null,
          request_type: timeOff.request_type,
          start_time: timeOff.start_time ? new Date(timeOff.start_time) : null,
          end_time: timeOff.end_time ? new Date(timeOff.end_time) : null,
          remote_id: originId,
          remote_created_at: timeOff.remote_created_at
            ? new Date(timeOff.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: timeOff.remote_was_deleted || false,
        };

        if (existingTimeOff) {
          existingTimeOff = await this.prisma.hris_time_off.update({
            where: { id_hris_time_off: existingTimeOff.id_hris_time_off },
            data: timeOffData,
          });
        } else {
          existingTimeOff = await this.prisma.hris_time_off.create({
            data: {
              ...timeOffData,
              id_hris_time_off: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        timeOffResults.push(existingTimeOff);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          timeOff.field_mappings,
          existingTimeOff.id_hris_time_off,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingTimeOff.id_hris_time_off,
          remote_data[i],
        );
      }

      return timeOffResults;
    } catch (error) {
      throw error;
    }
  }
}
