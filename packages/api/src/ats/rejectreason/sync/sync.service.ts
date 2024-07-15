import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS } from '@panora/shared';
import { ats_reject_reasons as AtsRejectReason } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IRejectReasonService } from '../types';
import { UnifiedRejectReasonOutput } from '../types/model.unified';

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
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'rejectreason', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-rejectreason',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing reject reasons...');
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = ATS_PROVIDERS;
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
      const service: IRejectReasonService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedRejectReasonOutput,
        OriginalRejectReasonOutput,
        IRejectReasonService
      >(integrationId, linkedUserId, 'ats', 'rejectreason', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    rejectReasons: UnifiedRejectReasonOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsRejectReason[]> {
    try {
      const rejectReasons_results: AtsRejectReason[] = [];

      const updateOrCreateRejectReason = async (
        rejectReason: UnifiedRejectReasonOutput,
        originId: string,
      ) => {
        let existingRejectReason;
        if (!originId) {
          existingRejectReason = await this.prisma.ats_reject_reasons.findFirst(
            {
              where: {
                name: rejectReason.name,
                id_connection: connection_id,
              },
            },
          );
        } else {
          existingRejectReason = await this.prisma.ats_reject_reasons.findFirst(
            {
              where: {
                remote_id: originId,
                id_connection: connection_id,
              },
            },
          );
        }

        const baseData: any = {
          name: rejectReason.name ?? null,
          modified_at: new Date(),
        };

        if (existingRejectReason) {
          return await this.prisma.ats_reject_reasons.update({
            where: {
              id_ats_reject_reason: existingRejectReason.id_ats_reject_reason,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_reject_reasons.create({
            data: {
              ...baseData,
              id_ats_reject_reason: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < rejectReasons.length; i++) {
        const rejectReason = rejectReasons[i];
        const originId = rejectReason.remote_id;

        const res = await updateOrCreateRejectReason(rejectReason, originId);
        const reject_reason_id = res.id_ats_reject_reason;
        rejectReasons_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          rejectReason.field_mappings,
          reject_reason_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          reject_reason_id,
          remote_data[i],
        );
      }
      return rejectReasons_results;
    } catch (error) {
      throw error;
    }
  }
}
