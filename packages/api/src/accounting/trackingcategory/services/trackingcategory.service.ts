import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingTrackingcategoryOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TrackingCategoryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TrackingCategoryService.name);
  }

  async getTrackingCategory(
    id_acc_tracking_category: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingTrackingcategoryOutput> {
    try {
      const trackingCategory =
        await this.prisma.acc_tracking_categories.findUnique({
          where: { id_acc_tracking_category: id_acc_tracking_category },
        });

      if (!trackingCategory) {
        throw new Error(
          `Tracking category with ID ${id_acc_tracking_category} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: trackingCategory.id_acc_tracking_category,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTrackingCategory: UnifiedAccountingTrackingcategoryOutput = {
        id: trackingCategory.id_acc_tracking_category,
        name: trackingCategory.name,
        status: trackingCategory.status,
        category_type: trackingCategory.category_type,
        parent_category: trackingCategory.parent_category,
        field_mappings: field_mappings,
        remote_id: trackingCategory.remote_id,
        created_at: trackingCategory.created_at,
        modified_at: trackingCategory.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: trackingCategory.id_acc_tracking_category,
          },
        });
        unifiedTrackingCategory.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.tracking_category.pull',
          method: 'GET',
          url: '/accounting/tracking_category',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTrackingCategory;
    } catch (error) {
      throw error;
    }
  }

  async getTrackingCategories(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingTrackingcategoryOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const trackingCategories =
        await this.prisma.acc_tracking_categories.findMany({
          take: limit + 1,
          cursor: cursor ? { id_acc_tracking_category: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        });

      const hasNextPage = trackingCategories.length > limit;
      if (hasNextPage) trackingCategories.pop();

      const unifiedTrackingCategories = await Promise.all(
        trackingCategories.map(async (trackingCategory) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: trackingCategory.id_acc_tracking_category,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTrackingCategory: UnifiedAccountingTrackingcategoryOutput =
            {
              id: trackingCategory.id_acc_tracking_category,
              name: trackingCategory.name,
              status: trackingCategory.status,
              category_type: trackingCategory.category_type,
              parent_category: trackingCategory.parent_category,
              field_mappings: field_mappings,
              remote_id: trackingCategory.remote_id,
              created_at: trackingCategory.created_at,
              modified_at: trackingCategory.modified_at,
            };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: trackingCategory.id_acc_tracking_category,
              },
            });
            unifiedTrackingCategory.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTrackingCategory;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.tracking_category.pull',
          method: 'GET',
          url: '/accounting/tracking_categories',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTrackingCategories,
        next_cursor: hasNextPage
          ? trackingCategories[trackingCategories.length - 1]
              .id_acc_tracking_category
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
