import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingCashflowstatementOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class CashflowStatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CashflowStatementService.name);
  }

  async getCashflowStatement(
    id_acc_cash_flow_statement: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingCashflowstatementOutput> {
    try {
      const cashFlowStatement =
        await this.prisma.acc_cash_flow_statements.findUnique({
          where: { id_acc_cash_flow_statement: id_acc_cash_flow_statement },
        });

      if (!cashFlowStatement) {
        throw new Error(
          `Cash flow statement with ID ${id_acc_cash_flow_statement} not found.`,
        );
      }

      const lineItems =
        await this.prisma.acc_cash_flow_statement_report_items.findMany({
          where: { id_acc_cash_flow_statement: id_acc_cash_flow_statement },
        });

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: cashFlowStatement.id_acc_cash_flow_statement,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedCashFlowStatement: UnifiedAccountingCashflowstatementOutput =
        {
          id: cashFlowStatement.id_acc_cash_flow_statement,
          name: cashFlowStatement.name,
          currency: cashFlowStatement.currency as CurrencyCode,
          company_id: cashFlowStatement.company,
          start_period: cashFlowStatement.start_period,
          end_period: cashFlowStatement.end_period,
          cash_at_beginning_of_period:
            cashFlowStatement.cash_at_beginning_of_period
              ? Number(cashFlowStatement.cash_at_beginning_of_period)
              : undefined,
          cash_at_end_of_period: cashFlowStatement.cash_at_end_of_period
            ? Number(cashFlowStatement.cash_at_end_of_period)
            : undefined,
          remote_generated_at: cashFlowStatement.remote_generated_at,
          field_mappings: field_mappings,
          remote_id: cashFlowStatement.remote_id,
          created_at: cashFlowStatement.created_at,
          modified_at: cashFlowStatement.modified_at,
          line_items: lineItems.map((item) => ({
            id: item.id_acc_cash_flow_statement_report_item,
            name: item.name,
            value: item.value ? Number(item.value) : undefined,
            type: item.type,
            parent_item: item.parent_item,
            remote_id: item.remote_id,
            remote_generated_at: item.remote_generated_at,
            created_at: item.created_at,
            modified_at: item.modified_at,
          })),
        };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: cashFlowStatement.id_acc_cash_flow_statement,
          },
        });
        unifiedCashFlowStatement.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.cashflow_statement.pull',
          method: 'GET',
          url: '/accounting/cashflow_statement',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedCashFlowStatement;
    } catch (error) {
      throw error;
    }
  }

  async getCashflowStatements(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingCashflowstatementOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const cashFlowStatements =
        await this.prisma.acc_cash_flow_statements.findMany({
          take: limit + 1,
          cursor: cursor ? { id_acc_cash_flow_statement: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        });

      const hasNextPage = cashFlowStatements.length > limit;
      if (hasNextPage) cashFlowStatements.pop();

      const unifiedCashFlowStatements = await Promise.all(
        cashFlowStatements.map(async (cashFlowStatement) => {
          const lineItems =
            await this.prisma.acc_cash_flow_statement_report_items.findMany({
              where: {
                id_acc_cash_flow_statement:
                  cashFlowStatement.id_acc_cash_flow_statement,
              },
            });

          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id:
                  cashFlowStatement.id_acc_cash_flow_statement,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedCashFlowStatement: UnifiedAccountingCashflowstatementOutput =
            {
              id: cashFlowStatement.id_acc_cash_flow_statement,
              name: cashFlowStatement.name,
              currency: cashFlowStatement.currency as CurrencyCode,
              company_id: cashFlowStatement.company,
              start_period: cashFlowStatement.start_period,
              end_period: cashFlowStatement.end_period,
              cash_at_beginning_of_period:
                cashFlowStatement.cash_at_beginning_of_period
                  ? Number(cashFlowStatement.cash_at_beginning_of_period)
                  : undefined,
              cash_at_end_of_period: cashFlowStatement.cash_at_end_of_period
                ? Number(cashFlowStatement.cash_at_end_of_period)
                : undefined,
              remote_generated_at: cashFlowStatement.remote_generated_at,
              field_mappings: field_mappings,
              remote_id: cashFlowStatement.remote_id,
              created_at: cashFlowStatement.created_at,
              modified_at: cashFlowStatement.modified_at,
              line_items: lineItems.map((item) => ({
                id: item.id_acc_cash_flow_statement_report_item,
                name: item.name,
                value: item.value ? Number(item.value) : undefined,
                type: item.type,
                parent_item: item.parent_item,
                remote_id: item.remote_id,
                remote_generated_at: item.remote_generated_at,
                created_at: item.created_at,
                modified_at: item.modified_at,
              })),
            };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id:
                  cashFlowStatement.id_acc_cash_flow_statement,
              },
            });
            unifiedCashFlowStatement.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedCashFlowStatement;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.cashflow_statement.pull',
          method: 'GET',
          url: '/accounting/cashflow_statements',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedCashFlowStatements,
        next_cursor: hasNextPage
          ? cashFlowStatements[cashFlowStatements.length - 1]
              .id_acc_cash_flow_statement
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
