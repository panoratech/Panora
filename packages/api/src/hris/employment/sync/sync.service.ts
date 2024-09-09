import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisEmploymentOutput } from '../types/model.unified';
import { IEmploymentService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_employments as HrisEmployment } from '@prisma/client';
import { OriginalEmploymentOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'employment', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = HRIS_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IEmploymentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisEmploymentOutput,
        OriginalEmploymentOutput,
        IEmploymentService
      >(integrationId, linkedUserId, 'hris', 'employment', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    employments: UnifiedHrisEmploymentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisEmployment[]> {
    try {
      const employmentResults: HrisEmployment[] = [];

      for (let i = 0; i < employments.length; i++) {
        const employment = employments[i];
        const originId = employment.remote_id;

        let existingEmployment = await this.prisma.hris_employments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const employmentData = {
          job_title: employment.job_title,
          pay_rate: employment.pay_rate ? BigInt(employment.pay_rate) : null,
          pay_period: employment.pay_period,
          pay_frequency: employment.pay_frequency,
          pay_currency: employment.pay_currency,
          flsa_status: employment.flsa_status,
          effective_date: employment.effective_date
            ? new Date(employment.effective_date)
            : null,
          employment_type: employment.employment_type,
          remote_id: originId,
          remote_created_at: employment.remote_created_at
            ? new Date(employment.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: employment.remote_was_deleted || false,
        };

        if (existingEmployment) {
          existingEmployment = await this.prisma.hris_employments.update({
            where: {
              id_hris_employment: existingEmployment.id_hris_employment,
            },
            data: employmentData,
          });
        } else {
          existingEmployment = await this.prisma.hris_employments.create({
            data: {
              ...employmentData,
              id_hris_employment: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        employmentResults.push(existingEmployment);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          employment.field_mappings,
          existingEmployment.id_hris_employment,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingEmployment.id_hris_employment,
          remote_data[i],
        );
      }

      return employmentResults;
    } catch (error) {
      throw error;
    }
  }
}
