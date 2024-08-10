import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedCrmStageOutput } from '../types/model.unified';

@Injectable()
export class StageService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(StageService.name);
  }

  async getStage(
    id_stage: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmStageOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmStageOutput format
      const unifiedStage: UnifiedCrmStageOutput = {
        id: stage.id_crm_deals_stage,
        stage_name: stage.stage_name,
        field_mappings: field_mappings,
        remote_id: stage.remote_id,
        created_at: stage.created_at,
        modified_at: stage.modified_at,
      };

      let res: UnifiedCrmStageOutput = {
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
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.stage.pull',
          method: 'GET',
          url: '/crm/stage',
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

  async getStages(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmStageOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_deals_stages.findFirst({
          where: {
            id_connection: connection_id,
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
          id_connection: connection_id,
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

      const unifiedStages: UnifiedCrmStageOutput[] = await Promise.all(
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
          // Convert the map to an object
const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmStageOutput format
          return {
            id: stage.id_crm_deals_stage,
            stage_name: stage.stage_name,
            field_mappings: field_mappings,
            remote_id: stage.remote_id,
            created_at: stage.created_at,
            modified_at: stage.modified_at,
          };
        }),
      );

      let res: UnifiedCrmStageOutput[] = unifiedStages;

      if (remote_data) {
        const remote_array_data: UnifiedCrmStageOutput[] = await Promise.all(
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

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
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
