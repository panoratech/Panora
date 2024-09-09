import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalVendorCreditOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_vendor_credits as AccVendorCredit } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IVendorCreditService } from '../types';
import {
  UnifiedAccountingVendorcreditOutput,
  LineItem,
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
    this.registry.registerService('accounting', 'vendorcredit', this);
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
      const service: IVendorCreditService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingVendorcreditOutput,
        OriginalVendorCreditOutput,
        IVendorCreditService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'vendor_credit',
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
    vendorCredits: UnifiedAccountingVendorcreditOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccVendorCredit[]> {
    try {
      const vendorCreditResults: AccVendorCredit[] = [];

      for (let i = 0; i < vendorCredits.length; i++) {
        const vendorCredit = vendorCredits[i];
        const originId = vendorCredit.remote_id;

        let existingVendorCredit =
          await this.prisma.acc_vendor_credits.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const vendorCreditData = {
          number: vendorCredit.number,
          transaction_date: vendorCredit.transaction_date,
          vendor: vendorCredit.vendor,
          total_amount: vendorCredit.total_amount
            ? Number(vendorCredit.total_amount)
            : null,
          currency: vendorCredit.currency as CurrencyCode,
          exchange_rate: vendorCredit.exchange_rate,
          id_acc_company: vendorCredit.company_id,
          tracking_categories: vendorCredit.tracking_categories || [],
          id_acc_accounting_period: vendorCredit.accounting_period_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingVendorCredit) {
          existingVendorCredit = await this.prisma.acc_vendor_credits.update({
            where: {
              id_acc_vendor_credit: existingVendorCredit.id_acc_vendor_credit,
            },
            data: vendorCreditData,
          });
        } else {
          existingVendorCredit = await this.prisma.acc_vendor_credits.create({
            data: {
              ...vendorCreditData,
              id_acc_vendor_credit: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        vendorCreditResults.push(existingVendorCredit);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          vendorCredit.field_mappings,
          existingVendorCredit.id_acc_vendor_credit,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingVendorCredit.id_acc_vendor_credit,
          remote_data[i],
        );

        // Handle line items
        if (vendorCredit.line_items && vendorCredit.line_items.length > 0) {
          await this.processVendorCreditLineItems(
            existingVendorCredit.id_acc_vendor_credit,
            vendorCredit.line_items,
          );
        }
      }

      return vendorCreditResults;
    } catch (error) {
      throw error;
    }
  }

  private async processVendorCreditLineItems(
    vendorCreditId: string,
    lineItems: LineItem[],
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        net_amount: lineItem.net_amount ? Number(lineItem.net_amount) : null,
        tracking_categories: lineItem.tracking_categories || [],
        description: lineItem.description,
        id_acc_account: lineItem.account_id,
        exchange_rate: lineItem.exchange_rate,
        id_acc_company_info: lineItem.company_info_id,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_acc_vendor_credit: vendorCreditId,
      };

      const existingLineItem =
        await this.prisma.acc_vendor_credit_lines.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_vendor_credit: vendorCreditId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_vendor_credit_lines.update({
          where: {
            id_acc_vendor_credit_line:
              existingLineItem.id_acc_vendor_credit_line,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_vendor_credit_lines.create({
          data: {
            ...lineItemData,
            id_acc_vendor_credit_line: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_vendor_credit_lines.deleteMany({
      where: {
        id_acc_vendor_credit: vendorCreditId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
