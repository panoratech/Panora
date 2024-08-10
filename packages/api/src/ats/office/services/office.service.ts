import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAtsOfficeOutput } from '../types/model.unified';

@Injectable()
export class OfficeService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OfficeService.name);
  }

  async getOffice(
    id_ats_office: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAtsOfficeOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedAtsOfficeOutput format
      const unifiedOffice: UnifiedAtsOfficeOutput = {
        id: office.id_ats_office,
        name: office.name,
        location: office.location,
        field_mappings: field_mappings,
        remote_id: office.remote_id,
        created_at: office.created_at,
        modified_at: office.modified_at,
      };

      let res: UnifiedAtsOfficeOutput = unifiedOffice;
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
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.office.pull',
          method: 'GET',
          url: '/ats/office',
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

  async getOffices(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAtsOfficeOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_offices.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_office: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const offices = await this.prisma.ats_offices.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_office: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {},
      });

      if (offices.length === limit + 1) {
        next_cursor = Buffer.from(
          offices[offices.length - 1].id_ats_office,
        ).toString('base64');
        offices.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedOffices: UnifiedAtsOfficeOutput[] = await Promise.all(
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
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedAtsOfficeOutput format
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

      let res: UnifiedAtsOfficeOutput[] = unifiedOffices;

      if (remote_data) {
        const remote_array_data: UnifiedAtsOfficeOutput[] = await Promise.all(
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
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.office.pull',
          method: 'GET',
          url: '/ats/offices',
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
