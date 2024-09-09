import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisPaygroupOutput } from '../types/model.unified';
import { IPayGroupService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_pay_groups as HrisPayGroup } from '@prisma/client';
import { OriginalPayGroupOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'paygroup', this);
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
      const service: IPayGroupService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisPaygroupOutput,
        OriginalPayGroupOutput,
        IPayGroupService
      >(integrationId, linkedUserId, 'hris', 'paygroup', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    paygroups: UnifiedHrisPaygroupOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisPayGroup[]> {
    try {
      const paygroupResults: HrisPayGroup[] = [];

      for (let i = 0; i < paygroups.length; i++) {
        const paygroup = paygroups[i];
        const originId = paygroup.remote_id;

        let existingPayGroup = await this.prisma.hris_pay_groups.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const paygroupData = {
          pay_group_name: paygroup.pay_group_name,
          remote_id: originId,
          remote_created_at: paygroup.remote_created_at
            ? new Date(paygroup.remote_created_at)
            : new Date(),
          modified_at: new Date(),
          remote_was_deleted: paygroup.remote_was_deleted || false,
        };

        if (existingPayGroup) {
          existingPayGroup = await this.prisma.hris_pay_groups.update({
            where: {
              id_hris_pay_group: existingPayGroup.id_hris_pay_group,
            },
            data: paygroupData,
          });
        } else {
          existingPayGroup = await this.prisma.hris_pay_groups.create({
            data: {
              ...paygroupData,
              id_hris_pay_group: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        paygroupResults.push(existingPayGroup);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          paygroup.field_mappings,
          existingPayGroup.id_hris_pay_group,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingPayGroup.id_hris_pay_group,
          remote_data[i],
        );
      }

      return paygroupResults;
    } catch (error) {
      throw error;
    }
  }
}
