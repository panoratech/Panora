import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedOfferOutput } from '../types/model.unified';

@Injectable()
export class OfferService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OfferService.name);
  }

  async getOffer(
    id_ats_offer: string,
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
  ): Promise<UnifiedOfferOutput[]> {
    try {
      const offers = await this.prisma.ats_offers.findMany({
        where: {
          id_connection: connection_id,
        },
      });

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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
