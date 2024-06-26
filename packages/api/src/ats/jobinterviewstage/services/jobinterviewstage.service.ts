import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedJobInterviewStageOutput } from '../types/model.unified';

@Injectable()
export class JobInterviewStageService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(JobInterviewStageService.name);
  }

  async getJobInterviewStage(
    id_ats_job_interview_stage: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput> {
    try {
      const stage = await this.prisma.ats_job_interview_stages.findUnique({
        where: {
          id_ats_job_interview_stage: id_ats_job_interview_stage,
        },
      });

      if (!stage) {
        throw new Error(
          `Job interview stage with ID ${id_ats_job_interview_stage} not found.`,
        );
      }

      // Fetch field mappings for the job interview stage
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: stage.id_ats_job_interview_stage,
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

      // Transform to UnifiedJobInterviewStageOutput format
      const unifiedJobInterviewStage: UnifiedJobInterviewStageOutput = {
        id: stage.id_ats_job_interview_stage,
        name: stage.name,
        stage_order: stage.stage_order,
        job_id: stage.id_ats_job,
        field_mappings: field_mappings,
        remote_id: stage.remote_id,
        created_at: stage.created_at,
        modified_at: stage.modified_at,
      };

      let res: UnifiedJobInterviewStageOutput = unifiedJobInterviewStage;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: stage.id_ats_job_interview_stage,
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
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.jobinterviewstage.pull',
          method: 'GET',
          url: '/ats/jobinterviewstage',
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

  async getJobInterviewStages(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedJobInterviewStageOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent =
          await this.prisma.ats_job_interview_stages.findFirst({
            where: {
              id_connection: connection_id,
              id_ats_job_interview_stage: cursor,
            },
          });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const stages = await this.prisma.ats_job_interview_stages.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_job_interview_stage: cursor,
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
          stages[stages.length - 1].id_ats_job_interview_stage,
        ).toString('base64');
        stages.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedStages: UnifiedJobInterviewStageOutput[] = await Promise.all(
        stages.map(async (stage) => {
          // Fetch field mappings for the job interview stage
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: stage.id_ats_job_interview_stage,
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

          // Transform to UnifiedJobInterviewStageOutput format
          return {
            id: stage.id_ats_job_interview_stage,
            name: stage.name,
            stage_order: stage.stage_order,
            job_id: stage.id_ats_job,
            field_mappings: field_mappings,
            remote_id: stage.remote_id,
            created_at: stage.created_at,
            modified_at: stage.modified_at,
          };
        }),
      );

      let res: UnifiedJobInterviewStageOutput[] = unifiedStages;

      if (remote_data) {
        const remote_array_data: UnifiedJobInterviewStageOutput[] =
          await Promise.all(
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
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.jobinterviewstage.pull',
          method: 'GET',
          url: '/ats/jobinterviewstages',
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
