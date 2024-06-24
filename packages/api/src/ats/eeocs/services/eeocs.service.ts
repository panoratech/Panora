import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedEeocsOutput } from '../types/model.unified';

@Injectable()
export class EeocsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(EeocsService.name);
  }

  async getEeocs(
    id_ats_eeoc: string,
    remote_data?: boolean,
  ): Promise<UnifiedEeocsOutput> {
    try {
      const eeocs = await this.prisma.ats_eeocs.findUnique({
        where: {
          id_ats_eeoc: id_ats_eeoc,
        },
      });

      if (!eeocs) {
        throw new Error(`EEOC with ID ${id_ats_eeoc} not found.`);
      }

      // Fetch field mappings for the EEOC
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: eeocs.id_ats_eeoc,
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

      // Transform to UnifiedEeocsOutput format
      const unifiedEeocs: UnifiedEeocsOutput = {
        id: eeocs.id_ats_eeoc,
        candidate_id: eeocs.id_ats_candidate,
        submitted_at: String(eeocs.submitted_at),
        race: eeocs.race,
        gender: eeocs.gender,
        veteran_status: eeocs.veteran_status,
        disability_status: eeocs.disability_status,
        field_mappings: field_mappings,
        remote_id: eeocs.remote_id,
        created_at: eeocs.created_at,
        modified_at: eeocs.modified_at,
      };

      let res: UnifiedEeocsOutput = unifiedEeocs;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: eeocs.id_ats_eeoc,
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

  async getEeocss(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedEeocsOutput[]> {
    try {
      const eeocss = await this.prisma.ats_eeocs.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedEeocss: UnifiedEeocsOutput[] = await Promise.all(
        eeocss.map(async (eeocs) => {
          // Fetch field mappings for the EEOC
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: eeocs.id_ats_eeoc,
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

          // Transform to UnifiedEeocsOutput format
          return {
            id: eeocs.id_ats_eeoc,
            candidate_id: eeocs.id_ats_candidate,
            submitted_at: String(eeocs.submitted_at),
            race: eeocs.race,
            gender: eeocs.gender,
            veteran_status: eeocs.veteran_status,
            disability_status: eeocs.disability_status,
            field_mappings: field_mappings,
            remote_id: eeocs.remote_id,
            created_at: eeocs.created_at,
            modified_at: eeocs.modified_at,
          };
        }),
      );

      let res: UnifiedEeocsOutput[] = unifiedEeocss;

      if (remote_data) {
        const remote_array_data: UnifiedEeocsOutput[] = await Promise.all(
          res.map(async (eeocs) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: eeocs.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...eeocs, remote_data };
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
