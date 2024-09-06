import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountingVendorcreditOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class VendorCreditService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(VendorCreditService.name);
  }

  async getVendorCredit(
    id_acc_vendor_credit: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingVendorcreditOutput> {
    try {
      const vendorCredit = await this.prisma.acc_vendor_credits.findUnique({
        where: { id_acc_vendor_credit: id_acc_vendor_credit },
      });

      if (!vendorCredit) {
        throw new Error(
          `Vendor credit with ID ${id_acc_vendor_credit} not found.`,
        );
      }

      const lineItems = await this.prisma.acc_vendor_credit_lines.findMany({
        where: { id_acc_vendor_credit: id_acc_vendor_credit },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: vendorCredit.id_acc_vendor_credit },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedVendorCredit: UnifiedAccountingVendorcreditOutput = {
        id: vendorCredit.id_acc_vendor_credit,
        number: vendorCredit.number,
        transaction_date: vendorCredit.transaction_date,
        vendor: vendorCredit.vendor,
        total_amount: vendorCredit.total_amount
          ? Number(vendorCredit.total_amount)
          : undefined,
        currency: vendorCredit.currency as CurrencyCode,
        exchange_rate: vendorCredit.exchange_rate,
        company_id: vendorCredit.company,
        tracking_categories: vendorCredit.tracking_categories,
        accounting_period_id: vendorCredit.accounting_period,
        field_mappings: field_mappings,
        remote_id: vendorCredit.remote_id,
        created_at: vendorCredit.created_at.toISOString(),
        modified_at: vendorCredit.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.id_acc_vendor_credit_line,
          net_amount: item.net_amount ? item.net_amount.toString() : undefined,
          tracking_categories: item.tracking_categories,
          description: item.description,
          id_acc_account: item.id_acc_account,
          exchange_rate: item.exchange_rate,
          id_acc_company_info: item.id_acc_company_info,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
          id_acc_vendor_credit: item.id_acc_vendor_credit,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: vendorCredit.id_acc_vendor_credit },
        });
        unifiedVendorCredit.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.vendor_credit.pull',
          method: 'GET',
          url: '/accounting/vendor_credit',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedVendorCredit;
    } catch (error) {
      throw error;
    }
  }

  async getVendorCredits(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingVendorcreditOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const vendorCredits = await this.prisma.acc_vendor_credits.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_vendor_credit: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = vendorCredits.length > limit;
      if (hasNextPage) vendorCredits.pop();

      const unifiedVendorCredits = await Promise.all(
        vendorCredits.map(async (vendorCredit) => {
          const lineItems = await this.prisma.acc_vendor_credit_lines.findMany({
            where: { id_acc_vendor_credit: vendorCredit.id_acc_vendor_credit },
          });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: vendorCredit.id_acc_vendor_credit },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedVendorCredit: UnifiedAccountingVendorcreditOutput = {
            id: vendorCredit.id_acc_vendor_credit,
            number: vendorCredit.number,
            transaction_date: vendorCredit.transaction_date,
            vendor: vendorCredit.vendor,
            total_amount: vendorCredit.total_amount
              ? Number(vendorCredit.total_amount)
              : undefined,
            currency: vendorCredit.currency as CurrencyCode as CurrencyCode,
            exchange_rate: vendorCredit.exchange_rate,
            company_id: vendorCredit.company,
            tracking_categories: vendorCredit.tracking_categories,
            accounting_period_id: vendorCredit.accounting_period,
            field_mappings: field_mappings,
            remote_id: vendorCredit.remote_id,
            created_at: vendorCredit.created_at.toISOString(),
            modified_at: vendorCredit.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_vendor_credit_line,
              net_amount: item.net_amount
                ? item.net_amount.toString()
                : undefined,
              tracking_categories: item.tracking_categories,
              description: item.description,
              id_acc_account: item.id_acc_account,
              exchange_rate: item.exchange_rate,
              id_acc_company_info: item.id_acc_company_info,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
              id_acc_vendor_credit: item.id_acc_vendor_credit,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: vendorCredit.id_acc_vendor_credit },
            });
            unifiedVendorCredit.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedVendorCredit;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.vendor_credit.pull',
          method: 'GET',
          url: '/accounting/vendor_credits',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedVendorCredits,
        next_cursor: hasNextPage
          ? vendorCredits[vendorCredits.length - 1].id_acc_vendor_credit
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
