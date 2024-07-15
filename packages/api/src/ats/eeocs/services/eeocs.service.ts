import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  EeocsDisabilityStatus,
  EeocsGender,
  EeocsRace,
  EeocsVeteranStatus,
  UnifiedEeocsOutput,
} from '../types/model.unified';

@Injectable()
export class EeocsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(EeocsService.name);
  }

  async getEeocs(
    id_ats_eeoc: string,
    linkedUserId: string,
    integrationId: string,
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
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.eeocs.pull',
          method: 'GET',
          url: '/ats/eeocs',
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

  async getEeocss(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedEeocsOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_eeocs.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_eeoc: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const eeocss = await this.prisma.ats_eeocs.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_eeoc: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (eeocss.length === limit + 1) {
        next_cursor = Buffer.from(
          eeocss[eeocss.length - 1].id_ats_eeoc,
        ).toString('base64');
        eeocss.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

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
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.eeocss.pull',
          method: 'GET',
          url: '/ats/eeocss',
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
