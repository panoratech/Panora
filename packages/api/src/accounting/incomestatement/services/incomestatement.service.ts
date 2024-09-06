import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingIncomestatementInput,
  UnifiedAccountingIncomestatementOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class IncomeStatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(IncomeStatementService.name);
  }

  async getIncomeStatement(
    id_acc_income_statement: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingIncomestatementOutput> {
    try {
      const incomeStatement =
        await this.prisma.acc_income_statements.findUnique({
          where: { id_acc_income_statement: id_acc_income_statement },
        });

      if (!incomeStatement) {
        throw new Error(
          `Income statement with ID ${id_acc_income_statement} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: incomeStatement.id_acc_income_statement,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedIncomeStatement: UnifiedAccountingIncomestatementOutput = {
        id: incomeStatement.id_acc_income_statement,
        name: incomeStatement.name,
        currency: incomeStatement.currency as CurrencyCode,
        start_period: incomeStatement.start_period,
        end_period: incomeStatement.end_period,
        gross_profit: incomeStatement.gross_profit
          ? Number(incomeStatement.gross_profit)
          : undefined,
        net_operating_income: incomeStatement.net_operating_income
          ? Number(incomeStatement.net_operating_income)
          : undefined,
        net_income: incomeStatement.net_income
          ? Number(incomeStatement.net_income)
          : undefined,
        field_mappings: field_mappings,
        remote_id: incomeStatement.remote_id,
        created_at: incomeStatement.created_at,
        modified_at: incomeStatement.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: incomeStatement.id_acc_income_statement,
          },
        });
        unifiedIncomeStatement.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.income_statement.pull',
          method: 'GET',
          url: '/accounting/income_statement',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedIncomeStatement;
    } catch (error) {
      throw error;
    }
  }

  async getIncomeStatements(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingIncomestatementOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const incomeStatements = await this.prisma.acc_income_statements.findMany(
        {
          take: limit + 1,
          cursor: cursor ? { id_acc_income_statement: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        },
      );

      const hasNextPage = incomeStatements.length > limit;
      if (hasNextPage) incomeStatements.pop();

      const unifiedIncomeStatements = await Promise.all(
        incomeStatements.map(async (incomeStatement) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: incomeStatement.id_acc_income_statement,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedIncomeStatement: UnifiedAccountingIncomestatementOutput =
            {
              id: incomeStatement.id_acc_income_statement,
              name: incomeStatement.name,
              currency: incomeStatement.currency as CurrencyCode,
              start_period: incomeStatement.start_period,
              end_period: incomeStatement.end_period,
              gross_profit: incomeStatement.gross_profit
                ? Number(incomeStatement.gross_profit)
                : undefined,
              net_operating_income: incomeStatement.net_operating_income
                ? Number(incomeStatement.net_operating_income)
                : undefined,
              net_income: incomeStatement.net_income
                ? Number(incomeStatement.net_income)
                : undefined,
              field_mappings: field_mappings,
              remote_id: incomeStatement.remote_id,
              created_at: incomeStatement.created_at,
              modified_at: incomeStatement.modified_at,
            };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: incomeStatement.id_acc_income_statement,
              },
            });
            unifiedIncomeStatement.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedIncomeStatement;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.income_statement.pull',
          method: 'GET',
          url: '/accounting/income_statements',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedIncomeStatements,
        next_cursor: hasNextPage
          ? incomeStatements[incomeStatements.length - 1]
              .id_acc_income_statement
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
