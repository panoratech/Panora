import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisGroupInput,
  UnifiedHrisGroupOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(GroupService.name);
  }

  async getGroup(
    id_hris_group: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisGroupOutput> {
    try {
      const group = await this.prisma.hris_groups.findUnique({
        where: { id_hris_group: id_hris_group },
      });

      if (!group) {
        throw new Error(`Group with ID ${id_hris_group} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: group.id_hris_group,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedGroup: UnifiedHrisGroupOutput = {
        id: group.id_hris_group,
        parent_group: group.parent_group,
        name: group.name,
        type: group.type,
        field_mappings: field_mappings,
        remote_id: group.remote_id,
        remote_created_at: group.remote_created_at,
        created_at: group.created_at,
        modified_at: group.modified_at,
        remote_was_deleted: group.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: group.id_hris_group,
          },
        });
        unifiedGroup.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.group.pull',
          method: 'GET',
          url: '/hris/group',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedGroup;
    } catch (error) {
      throw error;
    }
  }

  async getGroups(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisGroupOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const groups = await this.prisma.hris_groups.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_group: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = groups.length > limit;
      if (hasNextPage) groups.pop();

      const unifiedGroups = await Promise.all(
        groups.map(async (group) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: group.id_hris_group,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedGroup: UnifiedHrisGroupOutput = {
            id: group.id_hris_group,
            parent_group: group.parent_group,
            name: group.name,
            type: group.type,
            field_mappings: field_mappings,
            remote_id: group.remote_id,
            remote_created_at: group.remote_created_at,
            created_at: group.created_at,
            modified_at: group.modified_at,
            remote_was_deleted: group.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: group.id_hris_group,
              },
            });
            unifiedGroup.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedGroup;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.group.pull',
          method: 'GET',
          url: '/hris/groups',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedGroups,
        next_cursor: hasNextPage
          ? groups[groups.length - 1].id_hris_group
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
