import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { UnifiedTagOutput } from '../types/model.unified';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(TagService.name);
  }

  async getTag(
    id_ticketing_tag: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
    try {
      const tag = await this.prisma.tcg_tags.findUnique({
        where: {
          id_tcg_tag: id_ticketing_tag,
        },
      });

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: tag.id_tcg_tag,
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedTagOutput format
      const unifiedTag: UnifiedTagOutput = {
        id: tag.id_tcg_tag,
        name: tag.name,
        field_mappings: field_mappings,
      };

      let res: UnifiedTagOutput = unifiedTag;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: tag.id_tcg_tag,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getTags(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTagOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_tags.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_tag: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const tags = await this.prisma.tcg_tags.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_tag: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (tags.length === limit + 1) {
        next_cursor = Buffer.from(tags[tags.length - 1].id_tcg_tag).toString(
          'base64',
        );
        tags.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedTags: UnifiedTagOutput[] = await Promise.all(
        tags.map(async (tag) => {
          // Fetch field mappings for the tag
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: tag.id_tcg_tag,
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
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedTagOutput format
          return {
            id: tag.id_tcg_tag,
            name: tag.name,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedTagOutput[] = unifiedTags;

      if (remote_data) {
        const remote_array_data: UnifiedTagOutput[] = await Promise.all(
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
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.tag.pull',
          method: 'GET',
          url: '/ticketing/tags',
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
