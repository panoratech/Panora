import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedOfficeOutput } from '../types/model.unified';

@Injectable()
export class OfficeService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OfficeService.name);
  }

  async getOffice(
    id_ats_office: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput> {
    try {
      const office = await this.prisma.ats_offices.findUnique({
        where: {
          id_ats_office: id_ats_office,
        },
      });

      if (!office) {
        throw new Error(`Office with ID ${id_ats_office} not found.`);
      }

      // Fetch field mappings for the office
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: office.id_ats_office,
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

      // Transform to UnifiedOfficeOutput format
      const unifiedOffice: UnifiedOfficeOutput = {
        id: office.id_ats_office,
        name: office.name,
        location: office.location,
        field_mappings: field_mappings,
        remote_id: office.remote_id,
        created_at: office.created_at,
        modified_at: office.modified_at,
      };

      let res: UnifiedOfficeOutput = unifiedOffice;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: office.id_ats_office,
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

  async getOffices(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput[]> {
    try {
      const offices = await this.prisma.ats_offices.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedOffices: UnifiedOfficeOutput[] = await Promise.all(
        offices.map(async (office) => {
          // Fetch field mappings for the office
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: office.id_ats_office,
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

          // Transform to UnifiedOfficeOutput format
          return {
            id: office.id_ats_office,
            name: office.name,
            location: office.location,
            field_mappings: field_mappings,
            remote_id: office.remote_id,
            created_at: office.created_at,
            modified_at: office.modified_at,
          };
        }),
      );

      let res: UnifiedOfficeOutput[] = unifiedOffices;

      if (remote_data) {
        const remote_array_data: UnifiedOfficeOutput[] = await Promise.all(
          res.map(async (office) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: office.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...office, remote_data };
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
