import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalExpenseOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_expenses as AccExpense } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IExpenseService } from '../types';
import {
  LineItem,
  UnifiedAccountingExpenseOutput,
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
    this.registry.registerService('accounting', 'expense', this);
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
      const service: IExpenseService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingExpenseOutput,
        OriginalExpenseOutput,
        IExpenseService
      >(integrationId, linkedUserId, 'accounting', 'expense', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    expenses: UnifiedAccountingExpenseOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccExpense[]> {
    try {
      const expenseResults: AccExpense[] = [];

      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const originId = expense.remote_id;

        let existingExpense = await this.prisma.acc_expenses.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const expenseData = {
          transaction_date: expense.transaction_date
            ? new Date(expense.transaction_date)
            : null,
          total_amount: expense.total_amount
            ? Number(expense.total_amount)
            : null,
          sub_total: expense.sub_total ? Number(expense.sub_total) : null,
          total_tax_amount: expense.total_tax_amount
            ? Number(expense.total_tax_amount)
            : null,
          currency: expense.currency as CurrencyCode,
          exchange_rate: expense.exchange_rate,
          memo: expense.memo,
          id_acc_account: expense.account_id,
          id_acc_contact: expense.contact_id,
          id_acc_company_info: expense.company_info_id,
          tracking_categories: expense.tracking_categories,
          remote_id: originId,
          remote_created_at: expense.remote_created_at,
          modified_at: new Date(),
        };

        if (existingExpense) {
          existingExpense = await this.prisma.acc_expenses.update({
            where: { id_acc_expense: existingExpense.id_acc_expense },
            data: expenseData,
          });
        } else {
          existingExpense = await this.prisma.acc_expenses.create({
            data: {
              ...expenseData,
              id_acc_expense: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        expenseResults.push(existingExpense);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          expense.field_mappings,
          existingExpense.id_acc_expense,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingExpense.id_acc_expense,
          remote_data[i],
        );

        // Handle line items
        if (expense.line_items && expense.line_items.length > 0) {
          await this.processExpenseLineItems(
            existingExpense.id_acc_expense,
            expense.line_items,
            connection_id,
          );
        }
      }

      return expenseResults;
    } catch (error) {
      throw error;
    }
  }

  private async processExpenseLineItems(
    expenseId: string,
    lineItems: LineItem[],
    connectionId: string,
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        id_acc_expense: expenseId,
        remote_id: lineItem.remote_id,
        net_amount: lineItem.net_amount ? Number(lineItem.net_amount) : null,
        currency: lineItem.currency as CurrencyCode,
        description: lineItem.description,
        exchange_rate: lineItem.exchange_rate,
        modified_at: new Date(),
        id_connection: connectionId,
      };

      const existingLineItem = await this.prisma.acc_expense_lines.findFirst({
        where: {
          remote_id: lineItem.remote_id,
          id_acc_expense: expenseId,
        },
      });

      if (existingLineItem) {
        await this.prisma.acc_expense_lines.update({
          where: {
            id_acc_expense_line: existingLineItem.id_acc_expense_line,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_expense_lines.create({
          data: {
            ...lineItemData,
            id_acc_expense_line: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_expense_lines.deleteMany({
      where: {
        id_acc_expense: expenseId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
