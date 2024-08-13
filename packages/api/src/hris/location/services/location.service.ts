import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisLocationInput,
  UnifiedHrisLocationOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(LocationService.name);
  }

  async getLocation(
    id_hris_location: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisLocationOutput> {
    try {
      const location = await this.prisma.hris_locations.findUnique({
        where: { id_hris_location: id_hris_location },
      });

      if (!location) {
        throw new Error(`Location with ID ${id_hris_location} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: location.id_hris_location,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedLocation: UnifiedHrisLocationOutput = {
        id: location.id_hris_location,
        name: location.name,
        phone_number: location.phone_number,
        street_1: location.street_1,
        street_2: location.street_2,
        city: location.city,
        state: location.state,
        zip_code: location.zip_code,
        country: location.country,
        location_type: location.location_type,
        field_mappings: field_mappings,
        remote_id: location.remote_id,
        remote_created_at: location.remote_created_at,
        created_at: location.created_at,
        modified_at: location.modified_at,
        remote_was_deleted: location.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: location.id_hris_location,
          },
        });
        unifiedLocation.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.location.pull',
          method: 'GET',
          url: '/hris/location',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedLocation;
    } catch (error) {
      throw error;
    }
  }

  async getLocations(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisLocationOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const locations = await this.prisma.hris_locations.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_location: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = locations.length > limit;
      if (hasNextPage) locations.pop();

      const unifiedLocations = await Promise.all(
        locations.map(async (location) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: location.id_hris_location,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedLocation: UnifiedHrisLocationOutput = {
            id: location.id_hris_location,
            name: location.name,
            phone_number: location.phone_number,
            street_1: location.street_1,
            street_2: location.street_2,
            city: location.city,
            state: location.state,
            zip_code: location.zip_code,
            country: location.country,
            location_type: location.location_type,
            field_mappings: field_mappings,
            remote_id: location.remote_id,
            remote_created_at: location.remote_created_at,
            created_at: location.created_at,
            modified_at: location.modified_at,
            remote_was_deleted: location.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: location.id_hris_location,
              },
            });
            unifiedLocation.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedLocation;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.location.pull',
          method: 'GET',
          url: '/hris/locations',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedLocations,
        next_cursor: hasNextPage
          ? locations[locations.length - 1].id_hris_location
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
