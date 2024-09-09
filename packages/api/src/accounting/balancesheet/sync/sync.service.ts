import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalBalanceSheetOutput } from '@@core/utils/types/original/original.accounting';
import { LineItem } from '@accounting/cashflowstatement/types/model.unified';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_balance_sheets as AccBalanceSheet } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IBalanceSheetService } from '../types';
import { UnifiedAccountingBalancesheetOutput } from '../types/model.unified';
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
    this.registry.registerService('accounting', 'balancesheet', this);
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
      const service: IBalanceSheetService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingBalancesheetOutput,
        OriginalBalanceSheetOutput,
        IBalanceSheetService
      >(integrationId, linkedUserId, 'accounting', 'balancesheet', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    balanceSheets: UnifiedAccountingBalancesheetOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccBalanceSheet[]> {
    try {
      const balanceSheetResults: AccBalanceSheet[] = [];

      for (let i = 0; i < balanceSheets.length; i++) {
        const balanceSheet = balanceSheets[i];
        const originId = balanceSheet.remote_id;

        let existingBalanceSheet =
          await this.prisma.acc_balance_sheets.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const balanceSheetData = {
          name: balanceSheet.name,
          currency: balanceSheet.currency as CurrencyCode,
          id_acc_company_info: balanceSheet.company_info_id,
          date: balanceSheet.date,
          net_assets: balanceSheet.net_assets
            ? Number(balanceSheet.net_assets)
            : null,
          assets: balanceSheet.assets,
          liabilities: balanceSheet.liabilities,
          equity: balanceSheet.equity,
          remote_generated_at: balanceSheet.remote_generated_at,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingBalanceSheet) {
          existingBalanceSheet = await this.prisma.acc_balance_sheets.update({
            where: {
              id_acc_balance_sheet: existingBalanceSheet.id_acc_balance_sheet,
            },
            data: balanceSheetData,
          });
        } else {
          existingBalanceSheet = await this.prisma.acc_balance_sheets.create({
            data: {
              ...balanceSheetData,
              id_acc_balance_sheet: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        balanceSheetResults.push(existingBalanceSheet);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          balanceSheet.field_mappings,
          existingBalanceSheet.id_acc_balance_sheet,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingBalanceSheet.id_acc_balance_sheet,
          remote_data[i],
        );

        // Handle report items
        if (balanceSheet.line_items && balanceSheet.line_items.length > 0) {
          await this.processBalanceSheetReportItems(
            balanceSheet.line_items,
            existingBalanceSheet.id_acc_balance_sheet,
          );
        }
      }

      return balanceSheetResults;
    } catch (error) {
      throw error;
    }
  }

  private async processBalanceSheetReportItems(
    lineItems: LineItem[],
    balanceSheetId: string,
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        name: lineItem.name,
        value: lineItem.value ? Number(lineItem.value) : null,
        parent_item: lineItem.parent_item,
        id_acc_company_info: lineItem.company_info_id,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
      };

      const existingReportItem =
        await this.prisma.acc_balance_sheets_report_items.findFirst({
          where: {
            remote_id: lineItem.remote_id,
          },
        });

      if (existingReportItem) {
        await this.prisma.acc_balance_sheets_report_items.update({
          where: {
            id_acc_balance_sheets_report_item:
              existingReportItem.id_acc_balance_sheets_report_item,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_balance_sheets_report_items.create({
          data: {
            ...lineItemData,
            id_acc_balance_sheets_report_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing report items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_balance_sheets_report_items.deleteMany({
      where: {
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
