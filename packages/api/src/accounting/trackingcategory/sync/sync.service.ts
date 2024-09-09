import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingTrackingcategoryOutput } from '../types/model.unified';
import { ITrackingCategoryService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_tracking_categories as AccTrackingCategory } from '@prisma/client';
import { OriginalTrackingCategoryOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'trackingcategory', this);
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
      const service: ITrackingCategoryService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingTrackingcategoryOutput,
        OriginalTrackingCategoryOutput,
        ITrackingCategoryService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'tracking_category',
        service,
        [],
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    trackingCategories: UnifiedAccountingTrackingcategoryOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccTrackingCategory[]> {
    try {
      const trackingCategoryResults: AccTrackingCategory[] = [];

      for (let i = 0; i < trackingCategories.length; i++) {
        const trackingCategory = trackingCategories[i];
        const originId = trackingCategory.remote_id;

        let existingTrackingCategory =
          await this.prisma.acc_tracking_categories.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const trackingCategoryData = {
          name: trackingCategory.name,
          status: trackingCategory.status,
          category_type: trackingCategory.category_type,
          parent_category: trackingCategory.parent_category,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingTrackingCategory) {
          existingTrackingCategory =
            await this.prisma.acc_tracking_categories.update({
              where: {
                id_acc_tracking_category:
                  existingTrackingCategory.id_acc_tracking_category,
              },
              data: trackingCategoryData,
            });
        } else {
          existingTrackingCategory =
            await this.prisma.acc_tracking_categories.create({
              data: {
                ...trackingCategoryData,
                id_acc_tracking_category: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        trackingCategoryResults.push(existingTrackingCategory);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          trackingCategory.field_mappings,
          existingTrackingCategory.id_acc_tracking_category,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingTrackingCategory.id_acc_tracking_category,
          remote_data[i],
        );
      }

      return trackingCategoryResults;
    } catch (error) {
      throw error;
    }
  }
}
