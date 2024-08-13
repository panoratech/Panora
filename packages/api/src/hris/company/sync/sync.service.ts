import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisCompanyOutput } from '../types/model.unified';
import { ICompanyService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_companies as HrisCompany } from '@prisma/client';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'company', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing companies...');
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
      const service: ICompanyService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisCompanyOutput,
        OriginalCompanyOutput,
        ICompanyService
      >(integrationId, linkedUserId, 'hris', 'company', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    companies: UnifiedHrisCompanyOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisCompany[]> {
    try {
      const companyResults: HrisCompany[] = [];

      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const originId = company.remote_id;

        let existingCompany = await this.prisma.hris_companies.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const companyData = {
          legal_name: company.legal_name,
          display_name: company.display_name,
          eins: company.eins || [],
          locations: company.locations,
          remote_id: originId,
          remote_created_at: company.remote_created_at
            ? new Date(company.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: company.remote_was_deleted || false,
        };

        if (existingCompany) {
          existingCompany = await this.prisma.hris_companies.update({
            where: { id_hris_company: existingCompany.id_hris_company },
            data: companyData,
          });
        } else {
          existingCompany = await this.prisma.hris_companies.create({
            data: {
              ...companyData,
              id_hris_company: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        companyResults.push(existingCompany);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          company.field_mappings,
          existingCompany.id_hris_company,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingCompany.id_hris_company,
          remote_data[i],
        );
      }

      return companyResults;
    } catch (error) {
      throw error;
    }
  }
}
