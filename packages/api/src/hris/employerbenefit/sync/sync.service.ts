import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisEmployerbenefitOutput } from '../types/model.unified';
import { IEmployerBenefitService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_employer_benefits as HrisEmployerBenefit } from '@prisma/client';
import { OriginalEmployerBenefitOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'employerbenefit', this);
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
      const { integrationId, linkedUserId, id_company } = param;
      const service: IEmployerBenefitService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisEmployerbenefitOutput,
        OriginalEmployerBenefitOutput,
        IEmployerBenefitService
      >(integrationId, linkedUserId, 'hris', 'employerbenefit', service, [
        {
          param: id_company,
          paramName: 'id_company',
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
    employerBenefits: UnifiedHrisEmployerbenefitOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisEmployerBenefit[]> {
    try {
      const employerBenefitResults: HrisEmployerBenefit[] = [];

      for (let i = 0; i < employerBenefits.length; i++) {
        const employerBenefit = employerBenefits[i];
        const originId = employerBenefit.remote_id;

        let existingEmployerBenefit =
          await this.prisma.hris_employer_benefits.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const employerBenefitData = {
          benefit_plan_type: employerBenefit.benefit_plan_type,
          name: employerBenefit.name,
          description: employerBenefit.description,
          deduction_code: employerBenefit.deduction_code,
          remote_id: originId,
          remote_created_at: employerBenefit.remote_created_at
            ? new Date(employerBenefit.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: employerBenefit.remote_was_deleted || false,
        };

        if (existingEmployerBenefit) {
          existingEmployerBenefit =
            await this.prisma.hris_employer_benefits.update({
              where: {
                id_hris_employer_benefit:
                  existingEmployerBenefit.id_hris_employer_benefit,
              },
              data: employerBenefitData,
            });
        } else {
          existingEmployerBenefit =
            await this.prisma.hris_employer_benefits.create({
              data: {
                ...employerBenefitData,
                id_hris_employer_benefit: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        employerBenefitResults.push(existingEmployerBenefit);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          employerBenefit.field_mappings,
          existingEmployerBenefit.id_hris_employer_benefit,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingEmployerBenefit.id_hris_employer_benefit,
          remote_data[i],
        );
      }

      return employerBenefitResults;
    } catch (error) {
      throw error;
    }
  }
}
