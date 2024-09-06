import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalBenefitOutput } from '@@core/utils/types/original/original.hris';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_benefits as HrisBenefit } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IBenefitService } from '../types';
import { UnifiedHrisBenefitOutput } from '../types/model.unified';

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
    this.registry.registerService('hris', 'benefit', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing benefits...');
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
      const service: IBenefitService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisBenefitOutput,
        OriginalBenefitOutput,
        IBenefitService
      >(integrationId, linkedUserId, 'hris', 'benefit', service, [
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
    benefits: UnifiedHrisBenefitOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisBenefit[]> {
    try {
      const benefitResults: HrisBenefit[] = [];

      for (let i = 0; i < benefits.length; i++) {
        const benefit = benefits[i];
        const originId = benefit.remote_id;

        let existingBenefit = await this.prisma.hris_benefits.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const benefitData = {
          provider_name: benefit.provider_name,
          id_hris_employee: benefit.employee_id,
          employee_contribution: benefit.employee_contribution
            ? BigInt(benefit.employee_contribution)
            : null,
          company_contribution: benefit.company_contribution
            ? BigInt(benefit.company_contribution)
            : null,
          start_date: benefit.start_date ? new Date(benefit.start_date) : null,
          end_date: benefit.end_date ? new Date(benefit.end_date) : null,
          id_hris_employer_benefit: benefit.employer_benefit_id,
          remote_id: originId,
          remote_created_at: benefit.remote_created_at
            ? new Date(benefit.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: benefit.remote_was_deleted || false,
        };

        if (existingBenefit) {
          existingBenefit = await this.prisma.hris_benefits.update({
            where: { id_hris_benefit: existingBenefit.id_hris_benefit },
            data: benefitData,
          });
        } else {
          existingBenefit = await this.prisma.hris_benefits.create({
            data: {
              ...benefitData,
              id_hris_benefit: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        benefitResults.push(existingBenefit);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          benefit.field_mappings,
          existingBenefit.id_hris_benefit,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingBenefit.id_hris_benefit,
          remote_data[i],
        );
      }

      return benefitResults;
    } catch (error) {
      throw error;
    }
  }
}
