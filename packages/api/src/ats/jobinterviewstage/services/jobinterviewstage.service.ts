import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedJobInterviewStageOutput } from '../types/model.unified';

@Injectable()
export class JobInterviewStageService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(JobInterviewStageService.name);
  }

  async getJobInterviewStage(
    id_ats_job_interview_stage: string,
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
        job_id: stage.job_id,
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getJobInterviewStages(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput[]> {
    try {
      const stages = await this.prisma.ats_job_interview_stages.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

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
            job_id: stage.job_id,
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
