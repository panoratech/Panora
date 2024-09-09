import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingIncomestatementOutput } from '../types/model.unified';
import { IIncomeStatementService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_income_statements as AccIncomeStatement } from '@prisma/client';
import { OriginalIncomeStatementOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'incomestatement', this);
  }
  onModuleInit() {
    //
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
          const providers = ACCOUNTING_PROVIDERS;
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
      const service: IIncomeStatementService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingIncomestatementOutput,
        OriginalIncomeStatementOutput,
        IIncomeStatementService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'income_statement',
        service,
        [],
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    incomeStatements: UnifiedAccountingIncomestatementOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccIncomeStatement[]> {
    try {
      const incomeStatementResults: AccIncomeStatement[] = [];

      for (let i = 0; i < incomeStatements.length; i++) {
        const incomeStatement = incomeStatements[i];
        const originId = incomeStatement.remote_id;

        let existingIncomeStatement =
          await this.prisma.acc_income_statements.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const incomeStatementData = {
          name: incomeStatement.name,
          currency: incomeStatement.currency as CurrencyCode,
          start_period: incomeStatement.start_period,
          end_period: incomeStatement.end_period,
          gross_profit: incomeStatement.gross_profit
            ? Number(incomeStatement.gross_profit)
            : null,
          net_operating_income: incomeStatement.net_operating_income
            ? Number(incomeStatement.net_operating_income)
            : null,
          net_income: incomeStatement.net_income
            ? Number(incomeStatement.net_income)
            : null,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingIncomeStatement) {
          existingIncomeStatement =
            await this.prisma.acc_income_statements.update({
              where: {
                id_acc_income_statement:
                  existingIncomeStatement.id_acc_income_statement,
              },
              data: incomeStatementData,
            });
        } else {
          existingIncomeStatement =
            await this.prisma.acc_income_statements.create({
              data: {
                ...incomeStatementData,
                id_acc_income_statement: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        incomeStatementResults.push(existingIncomeStatement);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          incomeStatement.field_mappings,
          existingIncomeStatement.id_acc_income_statement,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingIncomeStatement.id_acc_income_statement,
          remote_data[i],
        );
      }

      return incomeStatementResults;
    } catch (error) {
      throw error;
    }
  }
}
