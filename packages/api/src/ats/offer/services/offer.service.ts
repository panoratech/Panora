import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { OfferStatus, UnifiedOfferOutput } from '../types/model.unified';

@Injectable()
export class OfferService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OfferService.name);
  }

  async getOffer(
    id_ats_offer: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput> {
    try {
      const offer = await this.prisma.ats_offers.findUnique({
        where: {
          id_ats_offer: id_ats_offer,
        },
      });

      if (!offer) {
        throw new Error(`Offer with ID ${id_ats_offer} not found.`);
      }

      // Fetch field mappings for the offer
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: offer.id_ats_offer,
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

      // Transform to UnifiedOfferOutput format
      const unifiedOffer: UnifiedOfferOutput = {
        id: offer.id_ats_offer,
        created_by: offer.created_by,
        remote_created_at: String(offer.remote_created_at),
        closed_at: String(offer.closed_at),
        sent_at: String(offer.sent_at),
        start_date: String(offer.start_date),
        status: offer.status,
        application_id: offer.id_ats_application,
        field_mappings: field_mappings,
        remote_id: offer.remote_id,
        created_at: offer.created_at,
        modified_at: offer.modified_at,
      };

      let res: UnifiedOfferOutput = unifiedOffer;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: offer.id_ats_offer,
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
          type: 'ats.offer.pull',
          method: 'GET',
          url: '/ats/offer',
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

  async getOffers(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedOfferOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_offers.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_offer: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const offers = await this.prisma.ats_offers.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_offer: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (offers.length === limit + 1) {
        next_cursor = Buffer.from(
          offers[offers.length - 1].id_ats_offer,
        ).toString('base64');
        offers.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }
      const unifiedOffers: UnifiedOfferOutput[] = await Promise.all(
        offers.map(async (offer) => {
          // Fetch field mappings for the offer
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: offer.id_ats_offer,
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

          // Transform to UnifiedOfferOutput format
          return {
            id: offer.id_ats_offer,
            created_by: offer.created_by,
            remote_created_at: String(offer.remote_created_at),
            closed_at: String(offer.closed_at),
            sent_at: String(offer.sent_at),
            start_date: String(offer.start_date),
            status: offer.status,
            application_id: offer.id_ats_application,
            field_mappings: field_mappings,
            remote_id: offer.remote_id,
            created_at: offer.created_at,
            modified_at: offer.modified_at,
          };
        }),
      );

      let res: UnifiedOfferOutput[] = unifiedOffers;

      if (remote_data) {
        const remote_array_data: UnifiedOfferOutput[] = await Promise.all(
          res.map(async (offer) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: offer.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...offer, remote_data };
          }),
        );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.offer.pull',
          method: 'GET',
          url: '/ats/offers',
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
