import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IOfficeService } from '../types';
import { OriginalOfficeOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedOfficeOutput } from '../types/model.unified';
import { ats_offices as AtsOffice } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
    this.registry.registerService('ats', 'office', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('ats-sync-offices', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing offices...');
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
      const service: IOfficeService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedOfficeOutput,
        OriginalOfficeOutput,
        IOfficeService
      >(integrationId, linkedUserId, 'ats', 'office', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    offices: UnifiedOfficeOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsOffice[]> {
    try {
      const offices_results: AtsOffice[] = [];

      const updateOrCreateOffice = async (
        office: UnifiedOfficeOutput,
        originId: string,
      ) => {
        let existingOffice;
        if (!originId) {
          existingOffice = await this.prisma.ats_offices.findFirst({
            where: {
              name: office.name,
              id_connection: connection_id,
            },
          });
        } else {
          existingOffice = await this.prisma.ats_offices.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          name: office.name ?? null,
          location: office.location ?? null,
          modified_at: new Date(),
        };

        if (existingOffice) {
          return await this.prisma.ats_offices.update({
            where: {
              id_ats_office: existingOffice.id_ats_office,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_offices.create({
            data: {
              ...baseData,
              id_ats_office: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < offices.length; i++) {
        const office = offices[i];
        const originId = office.remote_id;

        const res = await updateOrCreateOffice(office, originId);
        const office_id = res.id_ats_office;
        offices_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          office.field_mappings,
          office_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(office_id, remote_data[i]);
      }

      return offices_results;
    } catch (error) {
      throw error;
    }
  }
}
