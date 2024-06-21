import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedRejectReasonOutput } from '../types/model.unified';

@Injectable()
export class RejectReasonService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(RejectReasonService.name);
  }

  async getRejectReason(
    id_ats_reject_reason: string,
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getRejectReasons(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput[]> {
    try {
      const rejectReasons = await this.prisma.ats_reject_reasons.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
