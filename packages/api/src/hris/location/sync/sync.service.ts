import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisLocationOutput } from '../types/model.unified';
import { ILocationService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_locations as HrisLocation } from '@prisma/client';
import { OriginalLocationOutput } from '@@core/utils/types/original/original.hris';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('hris', 'location', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */12 * * *') // every 12 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing locations...');
      const users = user_id
        ? [await this.prisma.users.findUnique({ where: { id_user: user_id } })]
        : await this.prisma.users.findMany();

      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: { id_user: user.id_user },
          });
          for (const project of projects) {
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: { id_project: project.id_project },
            });
            for (const linkedUser of linkedUsers) {
              for (const provider of HRIS_PROVIDERS) {
                await this.syncForLinkedUser({
                  integrationId: provider,
                  linkedUserId: linkedUser.id_linked_user,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_employee } = param;
      const service: ILocationService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisLocationOutput,
        OriginalLocationOutput,
        ILocationService
      >(integrationId, linkedUserId, 'hris', 'location', service, [
        {
          param: id_employee,
          paramName: 'id_employee',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    locations: UnifiedHrisLocationOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_employee?: string,
  ): Promise<HrisLocation[]> {
    try {
      const locationResults: HrisLocation[] = [];

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const originId = location.remote_id;

        let existingLocation = await this.prisma.hris_locations.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const locationData = {
          name: location.name,
          phone_number: location.phone_number,
          street_1: location.street_1,
          street_2: location.street_2,
          id_hris_employee: id_employee || null,
          id_hris_company: location.company_id || null,
          city: location.city,
          state: location.state,
          zip_code: location.zip_code,
          country: location.country,
          location_type: location.location_type,
          remote_id: originId,
          remote_created_at: location.remote_created_at
            ? new Date(location.remote_created_at)
            : new Date(),
          modified_at: new Date(),
          remote_was_deleted: location.remote_was_deleted || false,
        };

        if (existingLocation) {
          existingLocation = await this.prisma.hris_locations.update({
            where: {
              id_hris_location: existingLocation.id_hris_location,
            },
            data: locationData,
          });
        } else {
          existingLocation = await this.prisma.hris_locations.create({
            data: {
              ...locationData,
              id_hris_location: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        locationResults.push(existingLocation);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          location.field_mappings,
          existingLocation.id_hris_location,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingLocation.id_hris_location,
          remote_data[i],
        );
      }

      return locationResults;
    } catch (error) {
      throw error;
    }
  }
}
