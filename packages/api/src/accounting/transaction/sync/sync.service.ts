import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalTransactionOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_transactions as AccTransaction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITransactionService } from '../types';
import {
  LineItem,
  UnifiedAccountingTransactionOutput,
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
    this.registry.registerService('accounting', 'transaction', this);
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
      const service: ITransactionService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingTransactionOutput,
        OriginalTransactionOutput,
        ITransactionService
      >(integrationId, linkedUserId, 'accounting', 'transaction', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    transactions: UnifiedAccountingTransactionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccTransaction[]> {
    try {
      const transactionResults: AccTransaction[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        const originId = transaction.remote_id;

        let existingTransaction = await this.prisma.acc_transactions.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const transactionData = {
          transaction_type: transaction.transaction_type,
          number: transaction.number ? Number(transaction.number) : null,
          transaction_date: transaction.transaction_date,
          total_amount: transaction.total_amount,
          exchange_rate: transaction.exchange_rate,
          currency: transaction.currency as CurrencyCode,
          tracking_categories: transaction.tracking_categories || [],
          id_acc_account: transaction.account_id,
          id_acc_contact: transaction.contact_id,
          id_acc_company_info: transaction.company_info_id,
          id_acc_accounting_period: transaction.accounting_period_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingTransaction) {
          existingTransaction = await this.prisma.acc_transactions.update({
            where: {
              id_acc_transaction: existingTransaction.id_acc_transaction,
            },
            data: transactionData,
          });
        } else {
          existingTransaction = await this.prisma.acc_transactions.create({
            data: {
              ...transactionData,
              id_acc_transaction: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        transactionResults.push(existingTransaction);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          transaction.field_mappings,
          existingTransaction.id_acc_transaction,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingTransaction.id_acc_transaction,
          remote_data[i],
        );

        // Handle line items (acc_transactions_lines_items)
        if (transaction.line_items && transaction.line_items.length > 0) {
          await this.processLineItems(
            existingTransaction.id_acc_transaction,
            transaction.line_items,
          );
        }
      }

      return transactionResults;
    } catch (error) {
      throw error;
    }
  }

  private async processLineItems(
    transactionId: string,
    lineItems: LineItem[],
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        memo: lineItem.memo,
        unit_price: lineItem.unit_price,
        quantity: lineItem.quantity,
        total_line_amount: lineItem.total_line_amount,
        tax_rate_id: lineItem.tax_rate_id,
        currency: lineItem.currency as CurrencyCode,
        exchange_rate: lineItem.exchange_rate,
        tracking_categories: lineItem.tracking_categories || [],
        id_acc_company_info: lineItem.company_info_id,
        id_acc_item: lineItem.item_id,
        id_acc_account: lineItem.account_id,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_acc_transaction: transactionId,
      };

      const existingLineItem =
        await this.prisma.acc_transactions_lines_items.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_transaction: transactionId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_transactions_lines_items.update({
          where: {
            id_acc_transactions_lines_item:
              existingLineItem.id_acc_transactions_lines_item,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_transactions_lines_items.create({
          data: {
            ...lineItemData,
            id_acc_transactions_lines_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_transactions_lines_items.deleteMany({
      where: {
        id_acc_transaction: transactionId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
