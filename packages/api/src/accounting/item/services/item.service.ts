import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingItemInput,
  UnifiedAccountingItemOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ItemService.name);
  }

  async getItem(
    id_acc_item: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingItemOutput> {
    try {
      const item = await this.prisma.acc_items.findUnique({
        where: { id_acc_item: id_acc_item },
      });

      if (!item) {
        throw new Error(`Item with ID ${id_acc_item} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: item.id_acc_item },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedItem: UnifiedAccountingItemOutput = {
        id: item.id_acc_item,
        name: item.name,
        status: item.status,
        unit_price: item.unit_price ? Number(item.unit_price) : undefined,
        purchase_price: item.purchase_price
          ? Number(item.purchase_price)
          : undefined,
        sales_account: item.sales_account,
        purchase_account: item.purchase_account,
        company_info_id: item.id_acc_company_info,
        field_mappings: field_mappings,
        remote_id: item.remote_id,
        remote_updated_at: item.remote_updated_at,
        created_at: item.created_at,
        modified_at: item.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: item.id_acc_item },
        });
        unifiedItem.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.item.pull',
          method: 'GET',
          url: '/accounting/item',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedItem;
    } catch (error) {
      throw error;
    }
  }
  async getItems(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingItemOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const items = await this.prisma.acc_items.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_item: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = items.length > limit;
      if (hasNextPage) items.pop();

      const unifiedItems = await Promise.all(
        items.map(async (item) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: item.id_acc_item },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedItem: UnifiedAccountingItemOutput = {
            id: item.id_acc_item,
            name: item.name,
            status: item.status,
            unit_price: item.unit_price ? Number(item.unit_price) : undefined,
            purchase_price: item.purchase_price
              ? Number(item.purchase_price)
              : undefined,
            sales_account: item.sales_account,
            purchase_account: item.purchase_account,
            company_info_id: item.id_acc_company_info,
            field_mappings: field_mappings,
            remote_id: item.remote_id,
            remote_updated_at: item.remote_updated_at,
            created_at: item.created_at,
            modified_at: item.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: item.id_acc_item },
            });
            unifiedItem.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedItem;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.item.pull',
          method: 'GET',
          url: '/accounting/items',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedItems,
        next_cursor: hasNextPage ? items[items.length - 1].id_acc_item : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
