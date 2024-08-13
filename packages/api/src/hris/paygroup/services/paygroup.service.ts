import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisPaygroupInput,
  UnifiedHrisPaygroupOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class PayGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PayGroupService.name);
  }

  async getPayGroup(
    id_hris_pay_group: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisPaygroupOutput> {
    try {
      const paygroup = await this.prisma.hris_pay_groups.findUnique({
        where: { id_hris_pay_group: id_hris_pay_group },
      });

      if (!paygroup) {
        throw new Error(`PayGroup with ID ${id_hris_pay_group} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: paygroup.id_hris_pay_group,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedPayGroup: UnifiedHrisPaygroupOutput = {
        id: paygroup.id_hris_pay_group,
        pay_group_name: paygroup.pay_group_name,
        field_mappings: field_mappings,
        remote_id: paygroup.remote_id,
        remote_created_at: paygroup.remote_created_at,
        created_at: paygroup.created_at,
        modified_at: paygroup.modified_at,
        remote_was_deleted: paygroup.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: paygroup.id_hris_pay_group,
          },
        });
        unifiedPayGroup.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.paygroup.pull',
          method: 'GET',
          url: '/hris/paygroup',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedPayGroup;
    } catch (error) {
      throw error;
    }
  }

  async getPayGroups(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisPaygroupOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const paygroups = await this.prisma.hris_pay_groups.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_pay_group: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = paygroups.length > limit;
      if (hasNextPage) paygroups.pop();

      const unifiedPayGroups = await Promise.all(
        paygroups.map(async (paygroup) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: paygroup.id_hris_pay_group,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedPayGroup: UnifiedHrisPaygroupOutput = {
            id: paygroup.id_hris_pay_group,
            pay_group_name: paygroup.pay_group_name,
            field_mappings: field_mappings,
            remote_id: paygroup.remote_id,
            remote_created_at: paygroup.remote_created_at,
            created_at: paygroup.created_at,
            modified_at: paygroup.modified_at,
            remote_was_deleted: paygroup.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: paygroup.id_hris_pay_group,
              },
            });
            unifiedPayGroup.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedPayGroup;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.paygroup.pull',
          method: 'GET',
          url: '/hris/paygroups',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedPayGroups,
        next_cursor: hasNextPage
          ? paygroups[paygroups.length - 1].id_hris_pay_group
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
