import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingExpenseInput,
  UnifiedAccountingExpenseOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ExpenseService.name);
  }

  async addExpense(
    unifiedExpenseData: UnifiedAccountingExpenseInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingExpenseOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addExpense(unifiedExpenseData, linkedUserId);

      const savedExpense = await this.prisma.acc_expenses.create({
        data: {
          id_acc_expense: uuidv4(),
          ...unifiedExpenseData,
          total_amount: unifiedExpenseData.total_amount
            ? Number(unifiedExpenseData.total_amount)
            : null,
          sub_total: unifiedExpenseData.sub_total
            ? Number(unifiedExpenseData.sub_total)
            : null,
          total_tax_amount: unifiedExpenseData.total_tax_amount
            ? Number(unifiedExpenseData.total_tax_amount)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      // Save line items
      if (unifiedExpenseData.line_items) {
        await Promise.all(
          unifiedExpenseData.line_items.map(async (lineItem) => {
            await this.prisma.acc_expense_lines.create({
              data: {
                id_acc_expense_line: uuidv4(),
                id_acc_expense: savedExpense.id_acc_expense,
                ...lineItem,
                net_amount: lineItem.net_amount
                  ? Number(lineItem.net_amount)
                  : null,
                created_at: new Date(),
                modified_at: new Date(),
                id_connection: connection_id,
              },
            });
          }),
        );
      }

      const result: UnifiedAccountingExpenseOutput = {
        ...savedExpense,
        currency: savedExpense.currency as CurrencyCode,
        id: savedExpense.id_acc_expense,
        total_amount: savedExpense.total_amount
          ? Number(savedExpense.total_amount)
          : undefined,
        sub_total: savedExpense.sub_total
          ? Number(savedExpense.sub_total)
          : undefined,
        total_tax_amount: savedExpense.total_tax_amount
          ? Number(savedExpense.total_tax_amount)
          : undefined,
        line_items: unifiedExpenseData.line_items,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getExpense(
    id_acc_expense: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingExpenseOutput> {
    try {
      const expense = await this.prisma.acc_expenses.findUnique({
        where: { id_acc_expense: id_acc_expense },
      });

      if (!expense) {
        throw new Error(`Expense with ID ${id_acc_expense} not found.`);
      }

      const lineItems = await this.prisma.acc_expense_lines.findMany({
        where: { id_acc_expense: id_acc_expense },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: expense.id_acc_expense },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedExpense: UnifiedAccountingExpenseOutput = {
        id: expense.id_acc_expense,
        transaction_date: expense.transaction_date,
        total_amount: expense.total_amount
          ? Number(expense.total_amount)
          : undefined,
        sub_total: expense.sub_total ? Number(expense.sub_total) : undefined,
        total_tax_amount: expense.total_tax_amount
          ? Number(expense.total_tax_amount)
          : undefined,
        currency: expense.currency as CurrencyCode,
        exchange_rate: expense.exchange_rate,
        memo: expense.memo,
        account_id: expense.id_acc_account,
        contact_id: expense.id_acc_contact,
        company_info_id: expense.id_acc_company_info,
        tracking_categories: expense.tracking_categories,
        field_mappings: field_mappings,
        remote_id: expense.remote_id,
        remote_created_at: expense.remote_created_at,
        created_at: expense.created_at,
        modified_at: expense.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.id_acc_expense_line,
          net_amount: item.net_amount ? Number(item.net_amount) : undefined,
          currency: item.currency as CurrencyCode,
          description: item.description,
          exchange_rate: item.exchange_rate,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: expense.id_acc_expense },
        });
        unifiedExpense.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.expense.pull',
          method: 'GET',
          url: '/accounting/expense',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedExpense;
    } catch (error) {
      throw error;
    }
  }

  async getExpenses(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingExpenseOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const expenses = await this.prisma.acc_expenses.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_expense: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = expenses.length > limit;
      if (hasNextPage) expenses.pop();

      const unifiedExpenses = await Promise.all(
        expenses.map(async (expense) => {
          const lineItems = await this.prisma.acc_expense_lines.findMany({
            where: { id_acc_expense: expense.id_acc_expense },
          });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: expense.id_acc_expense },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedExpense: UnifiedAccountingExpenseOutput = {
            id: expense.id_acc_expense,
            transaction_date: expense.transaction_date,
            total_amount: expense.total_amount
              ? Number(expense.total_amount)
              : undefined,
            sub_total: expense.sub_total
              ? Number(expense.sub_total)
              : undefined,
            total_tax_amount: expense.total_tax_amount
              ? Number(expense.total_tax_amount)
              : undefined,
            currency: expense.currency as CurrencyCode,
            exchange_rate: expense.exchange_rate,
            memo: expense.memo,
            account_id: expense.id_acc_account,
            contact_id: expense.id_acc_contact,
            company_info_id: expense.id_acc_company_info,
            tracking_categories: expense.tracking_categories,
            field_mappings: field_mappings,
            remote_id: expense.remote_id,
            remote_created_at: expense.remote_created_at,
            created_at: expense.created_at,
            modified_at: expense.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_expense_line,
              net_amount: item.net_amount ? Number(item.net_amount) : undefined,
              currency: item.currency as CurrencyCode,
              description: item.description,
              exchange_rate: item.exchange_rate,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: expense.id_acc_expense },
            });
            unifiedExpense.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedExpense;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.expense.pull',
          method: 'GET',
          url: '/accounting/expenses',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedExpenses,
        next_cursor: hasNextPage
          ? expenses[expenses.length - 1].id_acc_expense
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
