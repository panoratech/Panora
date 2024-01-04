import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { UnifiedTagOutput } from '../types/model.unified';
import { TagResponse } from '../types';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(TagService.name);
  }

  async getTag(
    id_ticketing_tag: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TagResponse>> {
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

      let res: TagResponse = {
        tags: [unifiedTag],
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: tag.id_tcg_tag,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: [remote_data],
        };
      }

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getTags(
    integrationId: string,
    linkedTagId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TagResponse>> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.tag.pull',
          method: 'GET',
          url: '/ticketing/tag',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedTagId,
        },
      });
      const job_id = job_resp_create.id_event;
      const tags = await this.prisma.tcg_tags.findMany({
        where: {
          remote_id: integrationId.toLowerCase(),
          events: {
            id_linked_user: linkedTagId,
          },
        },
      });

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

      let res: TagResponse = {
        tags: unifiedTags,
      };

      if (remote_data) {
        const remote_array_data: Record<string, any>[] = await Promise.all(
          tags.map(async (tag) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: tag.id_tcg_tag,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return remote_data;
          }),
        );

        res = {
          ...res,
          remote_data: remote_array_data,
        };
      }
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
