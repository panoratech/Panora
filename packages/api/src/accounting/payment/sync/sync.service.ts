import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalPaymentOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_payments as AccPayment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IPaymentService } from '../types';
import {
  LineItem,
  UnifiedAccountingPaymentOutput,
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
    this.registry.registerService('accounting', 'payment', this);
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
      const service: IPaymentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingPaymentOutput,
        OriginalPaymentOutput,
        IPaymentService
      >(integrationId, linkedUserId, 'accounting', 'payment', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    payments: UnifiedAccountingPaymentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccPayment[]> {
    try {
      const paymentResults: AccPayment[] = [];

      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const originId = payment.remote_id;

        let existingPayment = await this.prisma.acc_payments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const paymentData = {
          id_acc_invoice: payment.invoice_id,
          transaction_date: payment.transaction_date,
          id_acc_contact: payment.contact_id,
          id_acc_account: payment.account_id,
          currency: payment.currency as CurrencyCode,
          exchange_rate: payment.exchange_rate,
          total_amount: payment.total_amount
            ? Number(payment.total_amount)
            : null,
          type: payment.type,
          remote_updated_at: payment.remote_updated_at,
          id_acc_company_info: payment.company_info_id,
          id_acc_accounting_period: payment.accounting_period_id,
          tracking_categories: payment.tracking_categories,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingPayment) {
          existingPayment = await this.prisma.acc_payments.update({
            where: { id_acc_payment: existingPayment.id_acc_payment },
            data: paymentData,
          });
        } else {
          existingPayment = await this.prisma.acc_payments.create({
            data: {
              ...paymentData,
              id_acc_payment: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        paymentResults.push(existingPayment);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          payment.field_mappings,
          existingPayment.id_acc_payment,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingPayment.id_acc_payment,
          remote_data[i],
        );

        // Handle line items
        if (payment.line_items && payment.line_items.length > 0) {
          await this.processPaymentLineItems(
            existingPayment.id_acc_payment,
            payment.line_items,
            connection_id,
          );
        }
      }

      return paymentResults;
    } catch (error) {
      throw error;
    }
  }

  private async processPaymentLineItems(
    paymentId: string,
    lineItems: LineItem[],
    connectionId: string,
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        id_acc_payment: paymentId,
        applied_amount: lineItem.applied_amount
          ? Number(lineItem.applied_amount)
          : null,
        applied_date: lineItem.applied_date,
        related_object_id: lineItem.related_object_id,
        related_object_type: lineItem.related_object_type,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_connection: connectionId,
      };

      const existingLineItem =
        await this.prisma.acc_payments_line_items.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_payment: paymentId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_payments_line_items.update({
          where: {
            acc_payments_line_item: existingLineItem.acc_payments_line_item,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_payments_line_items.create({
          data: {
            ...lineItemData,
            acc_payments_line_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_payments_line_items.deleteMany({
      where: {
        id_acc_payment: paymentId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
