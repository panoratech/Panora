import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedStageOutput } from '../types/model.unified';
import { throwTypedError, UnifiedCrmError } from '@@core/utils/errors';

@Injectable()
export class StageService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(StageService.name);
  }

  async getStage(
    id_stage: string,
    remote_data?: boolean,
  ): Promise<UnifiedStageOutput> {
    try {
      const stage = await this.prisma.crm_deals_stages.findUnique({
        where: {
          id_crm_deals_stage: id_stage,
        },
      });

      // Fetch field mappings for the stage
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: stage.id_crm_deals_stage,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedStageOutput format
      const unifiedStage: UnifiedStageOutput = {
        id: stage.id_crm_deals_stage,
        stage_name: stage.stage_name,
        field_mappings: field_mappings,
      };

      let res: UnifiedStageOutput = {
        ...unifiedStage,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: stage.id_crm_deals_stage,
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

  async getStages(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedStageOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_deals_stages.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_crm_deals_stage: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const stages = await this.prisma.crm_deals_stages.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_deals_stage: cursor,
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

      if (stages.length === limit + 1) {
        next_cursor = Buffer.from(
          stages[stages.length - 1].id_crm_deals_stage,
        ).toString('base64');
        stages.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedStages: UnifiedStageOutput[] = await Promise.all(
        stages.map(async (stage) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: stage.id_crm_deals_stage,
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

          // Transform to UnifiedStageOutput format
          return {
            id: stage.id_crm_deals_stage,
            stage_name: stage.stage_name,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedStageOutput[] = unifiedStages;

      if (remote_data) {
        const remote_array_data: UnifiedStageOutput[] = await Promise.all(
          res.map(async (stage) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: stage.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...stage, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.stage.pulled',
          method: 'GET',
          url: '/crm/stages',
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
