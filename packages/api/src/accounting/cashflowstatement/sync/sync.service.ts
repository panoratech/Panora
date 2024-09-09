import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalCashflowStatementOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_cash_flow_statements as AccCashFlowStatement } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ICashflowStatementService } from '../types';
import {
  LineItem,
  UnifiedAccountingCashflowstatementOutput,
} from '../types/model.unified';
import { CurrencyCode } from '@@core/utils/types';

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
    this.registry.registerService('accounting', 'cashflowstatement', this);
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
      const service: ICashflowStatementService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingCashflowstatementOutput,
        OriginalCashflowStatementOutput,
        ICashflowStatementService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'cashflow_statement',
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
    cashFlowStatements: UnifiedAccountingCashflowstatementOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccCashFlowStatement[]> {
    try {
      const cashFlowStatementResults: AccCashFlowStatement[] = [];

      for (let i = 0; i < cashFlowStatements.length; i++) {
        const cashFlowStatement = cashFlowStatements[i];
        const originId = cashFlowStatement.remote_id;

        let existingCashFlowStatement =
          await this.prisma.acc_cash_flow_statements.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const cashFlowStatementData = {
          name: cashFlowStatement.name,
          currency: cashFlowStatement.currency as CurrencyCode,
          company: cashFlowStatement.company_id,
          start_period: cashFlowStatement.start_period,
          end_period: cashFlowStatement.end_period,
          cash_at_beginning_of_period:
            cashFlowStatement.cash_at_beginning_of_period
              ? Number(cashFlowStatement.cash_at_beginning_of_period)
              : null,
          cash_at_end_of_period: cashFlowStatement.cash_at_end_of_period
            ? Number(cashFlowStatement.cash_at_end_of_period)
            : null,
          remote_generated_at: cashFlowStatement.remote_generated_at,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingCashFlowStatement) {
          existingCashFlowStatement =
            await this.prisma.acc_cash_flow_statements.update({
              where: {
                id_acc_cash_flow_statement:
                  existingCashFlowStatement.id_acc_cash_flow_statement,
              },
              data: cashFlowStatementData,
            });
        } else {
          existingCashFlowStatement =
            await this.prisma.acc_cash_flow_statements.create({
              data: {
                ...cashFlowStatementData,
                id_acc_cash_flow_statement: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        cashFlowStatementResults.push(existingCashFlowStatement);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          cashFlowStatement.field_mappings,
          existingCashFlowStatement.id_acc_cash_flow_statement,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingCashFlowStatement.id_acc_cash_flow_statement,
          remote_data[i],
        );

        // Handle report items
        if (
          cashFlowStatement.line_items &&
          cashFlowStatement.line_items.length > 0
        ) {
          await this.processCashFlowStatementReportItems(
            existingCashFlowStatement.id_acc_cash_flow_statement,
            cashFlowStatement.line_items,
          );
        }
      }

      return cashFlowStatementResults;
    } catch (error) {
      throw error;
    }
  }

  private async processCashFlowStatementReportItems(
    cashFlowStatementId: string,
    reportItems: LineItem[],
  ): Promise<void> {
    for (const reportItem of reportItems) {
      const reportItemData = {
        name: reportItem.name,
        value: reportItem.value ? Number(reportItem.value) : null,
        type: reportItem.type,
        parent_item: reportItem.parent_item,
        remote_generated_at: reportItem.remote_generated_at,
        remote_id: reportItem.remote_id,
        modified_at: new Date(),
        id_acc_cash_flow_statement: cashFlowStatementId,
      };

      const existingReportItem =
        await this.prisma.acc_cash_flow_statement_report_items.findFirst({
          where: {
            remote_id: reportItem.remote_id,
            id_acc_cash_flow_statement: cashFlowStatementId,
          },
        });

      if (existingReportItem) {
        await this.prisma.acc_cash_flow_statement_report_items.update({
          where: {
            id_acc_cash_flow_statement_report_item:
              existingReportItem.id_acc_cash_flow_statement_report_item,
          },
          data: reportItemData,
        });
      } else {
        await this.prisma.acc_cash_flow_statement_report_items.create({
          data: {
            ...reportItemData,
            id_acc_cash_flow_statement_report_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing report items that are not in the current set
    const currentRemoteIds = reportItems.map((item) => item.remote_id);
    await this.prisma.acc_cash_flow_statement_report_items.deleteMany({
      where: {
        id_acc_cash_flow_statement: cashFlowStatementId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
