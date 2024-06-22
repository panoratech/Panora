import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedJobOutput } from '../types/model.unified';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(JobService.name);
  }

  async getJob(
    id_ats_job: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobOutput> {
    try {
      const job = await this.prisma.ats_jobs.findUnique({
        where: {
          id_ats_job: id_ats_job,
        },
      });

      if (!job) {
        throw new Error(`Job with ID ${id_ats_job} not found.`);
      }

      // Fetch field mappings for the job
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: job.id_ats_job,
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

      // Transform to UnifiedJobOutput format
      const unifiedJob: UnifiedJobOutput = {
        id: job.id_ats_job,
        name: job.name,
        description: job.description,
        code: job.code,
        status: job.status,
        type: job.type,
        confidential: job.confidential,
        departments: job.departments,
        offices: job.offices,
        managers: job.managers,
        recruiters: job.recruiters,
        remote_created_at: job.remote_created_at,
        remote_updated_at: job.remote_updated_at,
        field_mappings: field_mappings,
        remote_id: job.remote_id,
        created_at: job.created_at,
        modified_at: job.modified_at,
      };

      let res: UnifiedJobOutput = unifiedJob;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: job.id_ats_job,
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

  async getJobs(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobOutput[]> {
    try {
      const jobs = await this.prisma.ats_jobs.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedJobs: UnifiedJobOutput[] = await Promise.all(
        jobs.map(async (job) => {
          // Fetch field mappings for the job
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: job.id_ats_job,
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

          // Transform to UnifiedJobOutput format
          return {
            id: job.id_ats_job,
            name: job.name,
            description: job.description,
            code: job.code,
            status: job.status,
            type: job.type,
            confidential: job.confidential,
            departments: job.departments,
            offices: job.offices,
            managers: job.managers,
            recruiters: job.recruiters,
            remote_created_at: job.remote_created_at,
            remote_updated_at: job.remote_updated_at,
            field_mappings: field_mappings,
            remote_id: job.remote_id,
            created_at: job.created_at,
            modified_at: job.modified_at,
          };
        }),
      );

      let res: UnifiedJobOutput[] = unifiedJobs;

      if (remote_data) {
        const remote_array_data: UnifiedJobOutput[] = await Promise.all(
          res.map(async (job) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: job.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...job, remote_data };
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
