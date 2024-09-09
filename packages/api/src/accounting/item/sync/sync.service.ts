import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingItemOutput } from '../types/model.unified';
import { IItemService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_items as AccItem } from '@prisma/client';
import { OriginalItemOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'item', this);
  }
  onModuleInit() {
//
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
          const providers = ACCOUNTING_PROVIDERS;
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
      const service: IItemService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingItemOutput,
        OriginalItemOutput,
        IItemService
      >(integrationId, linkedUserId, 'accounting', 'item', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    items: UnifiedAccountingItemOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccItem[]> {
    try {
      const itemResults: AccItem[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const originId = item.remote_id;

        let existingItem = await this.prisma.acc_items.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const itemData = {
          name: item.name,
          status: item.status,
          unit_price: item.unit_price ? Number(item.unit_price) : null,
          purchase_price: item.purchase_price
            ? Number(item.purchase_price)
            : null,
          remote_updated_at: item.remote_updated_at,
          remote_id: originId,
          sales_account: item.sales_account,
          purchase_account: item.purchase_account,
          id_acc_company_info: item.company_info_id,
          modified_at: new Date(),
        };

        if (existingItem) {
          existingItem = await this.prisma.acc_items.update({
            where: { id_acc_item: existingItem.id_acc_item },
            data: itemData,
          });
        } else {
          existingItem = await this.prisma.acc_items.create({
            data: {
              ...itemData,
              id_acc_item: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        itemResults.push(existingItem);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          item.field_mappings,
          existingItem.id_acc_item,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingItem.id_acc_item,
          remote_data[i],
        );
      }

      return itemResults;
    } catch (error) {
      throw error;
    }
  }
}
