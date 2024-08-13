import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingTransactionOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async getTransaction(
    id_acc_transaction: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingTransactionOutput> {
    try {
      const transaction = await this.prisma.acc_transactions.findUnique({
        where: { id_acc_transaction: id_acc_transaction },
      });

      if (!transaction) {
        throw new Error(`Transaction with ID ${id_acc_transaction} not found.`);
      }

      const lineItems = await this.prisma.acc_transactions_lines_items.findMany(
        {
          where: { id_acc_transaction: id_acc_transaction },
        },
      );

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: transaction.id_acc_transaction },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTransaction: UnifiedAccountingTransactionOutput = {
        id: transaction.id_acc_transaction,
        transaction_type: transaction.transaction_type,
        number: transaction.number ? Number(transaction.number) : undefined,
        transaction_date: transaction.transaction_date,
        total_amount: transaction.total_amount,
        exchange_rate: transaction.exchange_rate,
        currency: transaction.currency as CurrencyCode,
        tracking_categories: transaction.tracking_categories,
        account_id: transaction.id_acc_account,
        contact_id: transaction.id_acc_contact,
        company_info_id: transaction.id_acc_company_info,
        accounting_period_id: transaction.id_acc_accounting_period,
        field_mappings: field_mappings,
        remote_id: transaction.remote_id,
        created_at: transaction.created_at,
        modified_at: transaction.modified_at,
        line_items: lineItems.map((item) => ({
          memo: item.memo,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_line_amount: item.total_line_amount,
          id_acc_tax_rate: item.id_acc_tax_rate,
          currency: item.currency as CurrencyCode,
          exchange_rate: item.exchange_rate,
          tracking_categories: item.tracking_categories,
          id_acc_company_info: item.id_acc_company_info,
          id_acc_item: item.id_acc_item,
          id_acc_account: item.id_acc_account,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: transaction.id_acc_transaction },
        });
        unifiedTransaction.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.transaction.pull',
          method: 'GET',
          url: '/accounting/transaction',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTransaction;
    } catch (error) {
      throw error;
    }
  }

  async getTransactions(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingTransactionOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const transactions = await this.prisma.acc_transactions.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_transaction: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = transactions.length > limit;
      if (hasNextPage) transactions.pop();

      const unifiedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const lineItems =
            await this.prisma.acc_transactions_lines_items.findMany({
              where: { id_acc_transaction: transaction.id_acc_transaction },
            });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: transaction.id_acc_transaction },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTransaction: UnifiedAccountingTransactionOutput = {
            id: transaction.id_acc_transaction,
            transaction_type: transaction.transaction_type,
            number: transaction.number ? Number(transaction.number) : undefined,
            transaction_date: transaction.transaction_date,
            total_amount: transaction.total_amount,
            exchange_rate: transaction.exchange_rate,
            currency: transaction.currency as CurrencyCode,
            tracking_categories: transaction.tracking_categories,
            account_id: transaction.id_acc_account,
            contact_id: transaction.id_acc_contact,
            company_info_id: transaction.id_acc_company_info,
            accounting_period_id: transaction.id_acc_accounting_period,
            field_mappings: field_mappings,
            remote_id: transaction.remote_id,
            created_at: transaction.created_at,
            modified_at: transaction.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_transactions_lines_item,
              memo: item.memo,
              unit_price: item.unit_price,
              quantity: item.quantity,
              total_line_amount: item.total_line_amount,
              id_acc_tax_rate: item.id_acc_tax_rate,
              currency: item.currency as CurrencyCode,
              exchange_rate: item.exchange_rate,
              tracking_categories: item.tracking_categories,
              id_acc_company_info: item.id_acc_company_info,
              id_acc_item: item.id_acc_item,
              id_acc_account: item.id_acc_account,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: transaction.id_acc_transaction },
            });
            unifiedTransaction.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTransaction;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.transaction.pull',
          method: 'GET',
          url: '/accounting/transactions',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTransactions,
        next_cursor: hasNextPage
          ? transactions[transactions.length - 1].id_acc_transaction
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
