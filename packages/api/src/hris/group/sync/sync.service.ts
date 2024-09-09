import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisGroupOutput } from '../types/model.unified';
import { IGroupService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_groups as HrisGroup } from '@prisma/client';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'group', this);
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
      const { integrationId, linkedUserId, id_company } = param;
      const service: IGroupService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisGroupOutput,
        OriginalGroupOutput,
        IGroupService
      >(integrationId, linkedUserId, 'hris', 'group', service, [
        {
          param: id_company,
          paramName: 'id_company',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    groups: UnifiedHrisGroupOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisGroup[]> {
    try {
      const groupResults: HrisGroup[] = [];

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const originId = group.remote_id;

        let existingGroup = await this.prisma.hris_groups.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const groupData = {
          parent_group: group.parent_group,
          name: group.name,
          type: group.type,
          remote_id: originId,
          remote_created_at: group.remote_created_at
            ? new Date(group.remote_created_at)
            : new Date(),
          modified_at: new Date(),
          remote_was_deleted: group.remote_was_deleted || false,
        };

        if (existingGroup) {
          existingGroup = await this.prisma.hris_groups.update({
            where: {
              id_hris_group: existingGroup.id_hris_group,
            },
            data: groupData,
          });
        } else {
          existingGroup = await this.prisma.hris_groups.create({
            data: {
              ...groupData,
              id_hris_group: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        groupResults.push(existingGroup);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          group.field_mappings,
          existingGroup.id_hris_group,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingGroup.id_hris_group,
          remote_data[i],
        );
      }

      return groupResults;
    } catch (error) {
      throw error;
    }
  }
}
