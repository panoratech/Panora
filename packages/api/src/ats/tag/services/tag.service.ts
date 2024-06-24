import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { UnifiedTagOutput } from '../types/model.unified';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(TagService.name);
  }

  async getTag(
    id_ats_tag: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
    try {
      const tag = await this.prisma.ats_tags.findUnique({
        where: {
          id_ats_tag: id_ats_tag,
        },
      });

      if (!tag) {
        throw new Error(`Tag with ID ${id_ats_tag} not found.`);
      }

      // Fetch field mappings for the tag
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: tag.id_ats_tag,
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
        id: tag.id_ats_tag,
        name: tag.name,
        id_ats_candidate: tag.id_ats_candidate,
        field_mappings: field_mappings,
        remote_id: tag.remote_id,
        created_at: tag.created_at,
        modified_at: tag.modified_at,
      };

      let res: UnifiedTagOutput = unifiedTag;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: tag.id_ats_tag,
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
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedTagOutput[]> {
    try {
      const tags = await this.prisma.ats_tags.findMany({
        where: {
          id_connection: connection_id,
        },
      });

      const unifiedTags: UnifiedTagOutput[] = await Promise.all(
        tags.map(async (tag) => {
          // Fetch field mappings for the tag
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: tag.id_ats_tag,
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
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedTagOutput format
          return {
            id: tag.id_ats_tag,
            name: tag.name,
            id_ats_candidate: tag.id_ats_candidate,
            remote_created_at: tag.remote_created_at,
            remote_modified_at: tag.remote_modified_at,
            field_mappings: field_mappings,
            remote_id: tag.remote_id,
            created_at: tag.created_at,
            modified_at: tag.modified_at,
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
