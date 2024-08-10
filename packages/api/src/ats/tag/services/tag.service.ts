import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { UnifiedAtsTagOutput } from '../types/model.unified';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class TagService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(TagService.name);
  }

  async getTag(
    id_ats_candidate_tag: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAtsTagOutput> {
    try {
      const tag = await this.prisma.ats_candidate_tags.findUnique({
        where: {
          id_ats_candidate_tag: id_ats_candidate_tag,
        },
      });

      if (!tag) {
        throw new Error(`Tag with ID ${id_ats_candidate_tag} not found.`);
      }

      // Fetch field mappings for the tag
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: tag.id_ats_candidate_tag,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedAtsTagOutput format
      const unifiedTag: UnifiedAtsTagOutput = {
        id: tag.id_ats_candidate_tag,
        name: tag.name,
        field_mappings: field_mappings,
        remote_id: tag.remote_id,
        created_at: String(tag.created_at),
        modified_at: String(tag.modified_at),
      };

      let res: UnifiedAtsTagOutput = unifiedTag;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: tag.id_ats_candidate_tag,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.tag.pull',
          method: 'GET',
          url: '/ats/tag',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getTags(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAtsTagOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_candidate_tags.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_candidate_tag: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const tags = await this.prisma.ats_candidate_tags.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_candidate_tag: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {},
      });

      if (tags.length === limit + 1) {
        next_cursor = Buffer.from(
          tags[tags.length - 1].id_ats_candidate_tag,
        ).toString('base64');
        tags.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedTags: UnifiedAtsTagOutput[] = await Promise.all(
        tags.map(async (tag) => {
          // Fetch field mappings for the tag
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: tag.id_ats_candidate_tag,
              },
            },
            include: {
              attribute: true,
            },
          });

          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedAtsTagOutput format
          return {
            id: tag.id_ats_candidate_tag,
            name: tag.name,
            remote_created_at: null,
            remote_modified_at: null,
            field_mappings: field_mappings,
            remote_id: tag.remote_id,
            created_at: String(tag.created_at),
            modified_at: String(tag.modified_at),
          };
        }),
      );

      let res: UnifiedAtsTagOutput[] = unifiedTags;

      if (remote_data) {
        const remote_array_data: UnifiedAtsTagOutput[] = await Promise.all(
          res.map(async (tag) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: tag.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...tag, remote_data };
          }),
        );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.tag.pull',
          method: 'GET',
          url: '/ats/tags',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
