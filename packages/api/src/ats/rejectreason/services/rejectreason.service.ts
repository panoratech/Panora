import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedRejectReasonOutput } from '../types/model.unified';

@Injectable()
export class RejectReasonService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(RejectReasonService.name);
  }

  async getRejectReason(
    id_ats_reject_reason: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput> {
    try {
      const rejectReason = await this.prisma.ats_reject_reasons.findUnique({
        where: {
          id_ats_reject_reason: id_ats_reject_reason,
        },
      });

      if (!rejectReason) {
        throw new Error(
          `Reject reason with ID ${id_ats_reject_reason} not found.`,
        );
      }

      // Fetch field mappings for the reject reason
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: rejectReason.id_ats_reject_reason,
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

      // Transform to UnifiedRejectReasonOutput format
      const unifiedRejectReason: UnifiedRejectReasonOutput = {
        id: rejectReason.id_ats_reject_reason,
        name: rejectReason.name,
        field_mappings: field_mappings,
        remote_id: rejectReason.remote_id,
        created_at: rejectReason.created_at,
        modified_at: rejectReason.modified_at,
      };

      let res: UnifiedRejectReasonOutput = unifiedRejectReason;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: rejectReason.id_ats_reject_reason,
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
          type: 'ats.rejectreason.pull',
          method: 'GET',
          url: '/ats/rejectreason',
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

  async getRejectReasons(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedRejectReasonOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_reject_reasons.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_reject_reason: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const rejectReasons = await this.prisma.ats_reject_reasons.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_reject_reason: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (rejectReasons.length === limit + 1) {
        next_cursor = Buffer.from(
          rejectReasons[rejectReasons.length - 1].id_ats_reject_reason,
        ).toString('base64');
        rejectReasons.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }
      const unifiedRejectReasons: UnifiedRejectReasonOutput[] =
        await Promise.all(
          rejectReasons.map(async (rejectReason) => {
            // Fetch field mappings for the reject reason
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: rejectReason.id_ats_reject_reason,
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

            // Transform to UnifiedRejectReasonOutput format
            return {
              id: rejectReason.id_ats_reject_reason,
              name: rejectReason.name,
              field_mappings: field_mappings,
              remote_id: rejectReason.remote_id,
              created_at: rejectReason.created_at,
              modified_at: rejectReason.modified_at,
            };
          }),
        );

      let res: UnifiedRejectReasonOutput[] = unifiedRejectReasons;

      if (remote_data) {
        const remote_array_data: UnifiedRejectReasonOutput[] =
          await Promise.all(
            res.map(async (rejectReason) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: rejectReason.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...rejectReason, remote_data };
            }),
          );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.rejectreason.pull',
          method: 'GET',
          url: '/ats/rejectreasons',
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
