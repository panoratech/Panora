import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingBalancesheetOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class BalanceSheetService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BalanceSheetService.name);
  }

  async getBalanceSheet(
    id_acc_balance_sheet: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingBalancesheetOutput> {
    try {
      const balanceSheet = await this.prisma.acc_balance_sheets.findUnique({
        where: { id_acc_balance_sheet: id_acc_balance_sheet },
      });

      if (!balanceSheet) {
        throw new Error(
          `Balance sheet with ID ${id_acc_balance_sheet} not found.`,
        );
      }

      const lineItems =
        await this.prisma.acc_balance_sheets_report_items.findMany({
          where: { id_acc_company_info: balanceSheet.id_acc_company_info },
        });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: balanceSheet.id_acc_balance_sheet },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedBalanceSheet: UnifiedAccountingBalancesheetOutput = {
        id: balanceSheet.id_acc_balance_sheet,
        name: balanceSheet.name,
        currency: balanceSheet.currency as CurrencyCode,
        company_info_id: balanceSheet.id_acc_company_info,
        date: balanceSheet.date,
        net_assets: balanceSheet.net_assets
          ? Number(balanceSheet.net_assets)
          : undefined,
        assets: balanceSheet.assets,
        liabilities: balanceSheet.liabilities,
        equity: balanceSheet.equity,
        remote_generated_at: balanceSheet.remote_generated_at,
        field_mappings: field_mappings,
        remote_id: balanceSheet.remote_id,
        created_at: balanceSheet.created_at,
        modified_at: balanceSheet.modified_at,
        line_items: lineItems.map((item) => ({
          name: item.name,
          value: item.value ? Number(item.value) : undefined,
          parent_item: item.parent_item,
          company_info_id: item.id_acc_company_info,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: balanceSheet.id_acc_balance_sheet },
        });
        unifiedBalanceSheet.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.balance_sheet.pull',
          method: 'GET',
          url: '/accounting/balance_sheet',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedBalanceSheet;
    } catch (error) {
      throw error;
    }
  }

  async getBalanceSheets(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingBalancesheetOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const balanceSheets = await this.prisma.acc_balance_sheets.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_balance_sheet: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = balanceSheets.length > limit;
      if (hasNextPage) balanceSheets.pop();

      const unifiedBalanceSheets = await Promise.all(
        balanceSheets.map(async (balanceSheet) => {
          const lineItems =
            await this.prisma.acc_balance_sheets_report_items.findMany({
              where: { id_acc_company_info: balanceSheet.id_acc_company_info },
            });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: balanceSheet.id_acc_balance_sheet },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedBalanceSheet: UnifiedAccountingBalancesheetOutput = {
            id: balanceSheet.id_acc_balance_sheet,
            name: balanceSheet.name,
            currency: balanceSheet.currency as CurrencyCode,
            company_info_id: balanceSheet.id_acc_company_info,
            date: balanceSheet.date,
            net_assets: balanceSheet.net_assets
              ? Number(balanceSheet.net_assets)
              : undefined,
            assets: balanceSheet.assets,
            liabilities: balanceSheet.liabilities,
            equity: balanceSheet.equity,
            remote_generated_at: balanceSheet.remote_generated_at,
            field_mappings: field_mappings,
            remote_id: balanceSheet.remote_id,
            created_at: balanceSheet.created_at,
            modified_at: balanceSheet.modified_at,
            line_items: lineItems.map((item) => ({
              name: item.name,
              value: item.value ? Number(item.value) : undefined,
              parent_item: item.parent_item,
              company_info_id: item.id_acc_company_info,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: balanceSheet.id_acc_balance_sheet },
            });
            unifiedBalanceSheet.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedBalanceSheet;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.balance_sheet.pull',
          method: 'GET',
          url: '/accounting/balance_sheets',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedBalanceSheets,
        next_cursor: hasNextPage
          ? balanceSheets[balanceSheets.length - 1].id_acc_balance_sheet
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
