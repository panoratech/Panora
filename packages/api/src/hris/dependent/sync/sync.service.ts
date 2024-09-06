import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisDependentOutput } from '../types/model.unified';
import { IDependentService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_dependents as HrisDependent } from '@prisma/client';
import { OriginalDependentOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'dependent', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing dependents...');
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
      const { integrationId, linkedUserId } = param;
      const service: IDependentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisDependentOutput,
        OriginalDependentOutput,
        IDependentService
      >(integrationId, linkedUserId, 'hris', 'dependent', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    dependents: UnifiedHrisDependentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisDependent[]> {
    try {
      const dependentResults: HrisDependent[] = [];

      for (let i = 0; i < dependents.length; i++) {
        const dependent = dependents[i];
        const originId = dependent.remote_id;

        let existingDependent = await this.prisma.hris_dependents.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const dependentData = {
          first_name: dependent.first_name,
          last_name: dependent.last_name,
          middle_name: dependent.middle_name,
          relationship: dependent.relationship,
          date_of_birth: dependent.date_of_birth
            ? new Date(dependent.date_of_birth)
            : null,
          gender: dependent.gender,
          phone_number: dependent.phone_number,
          home_location: dependent.home_location,
          is_student: dependent.is_student,
          ssn: dependent.ssn,
          id_hris_employee: dependent.employee_id,
          remote_id: originId,
          remote_created_at: dependent.remote_created_at
            ? new Date(dependent.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: dependent.remote_was_deleted || false,
        };

        if (existingDependent) {
          existingDependent = await this.prisma.hris_dependents.update({
            where: { id_hris_dependents: existingDependent.id_hris_dependents },
            data: dependentData,
          });
        } else {
          existingDependent = await this.prisma.hris_dependents.create({
            data: {
              ...dependentData,
              id_hris_dependents: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        dependentResults.push(existingDependent);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          dependent.field_mappings,
          existingDependent.id_hris_dependents,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingDependent.id_hris_dependents,
          remote_data[i],
        );
      }

      return dependentResults;
    } catch (error) {
      throw error;
    }
  }
}
