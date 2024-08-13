import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingAccountInput,
  UnifiedAccountingAccountOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AccountService.name);
  }

  async addAccount(
    unifiedAccountData: UnifiedAccountingAccountInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingAccountOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addAccount(unifiedAccountData, linkedUserId);

      const savedAccount = await this.prisma.acc_accounts.create({
        data: {
          id_acc_account: uuidv4(),
          ...unifiedAccountData,
          current_balance: unifiedAccountData.current_balance
            ? Number(unifiedAccountData.current_balance)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: resp.data.id_connection,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      const result: UnifiedAccountingAccountOutput = {
        ...savedAccount,
        currency: savedAccount.currency as CurrencyCode,
        id: savedAccount.id_acc_account,
        current_balance: savedAccount.current_balance
          ? Number(savedAccount.current_balance)
          : undefined,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAccount(
    id_acc_account: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingAccountOutput> {
    try {
      const account = await this.prisma.acc_accounts.findUnique({
        where: { id_acc_account: id_acc_account },
      });

      if (!account) {
        throw new Error(`Account with ID ${id_acc_account} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: account.id_acc_account },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedAccount: UnifiedAccountingAccountOutput = {
        id: account.id_acc_account,
        name: account.name,
        description: account.description,
        classification: account.classification,
        type: account.type,
        status: account.status,
        current_balance: account.current_balance
          ? Number(account.current_balance)
          : undefined,
        currency: account.currency as CurrencyCode,
        account_number: account.account_number,
        parent_account: account.parent_account,
        company_info_id: account.id_acc_company_info,
        field_mappings: field_mappings,
        remote_id: account.remote_id,
        created_at: account.created_at,
        modified_at: account.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: account.id_acc_account },
        });
        unifiedAccount.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.account.pull',
          method: 'GET',
          url: '/accounting/account',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedAccount;
    } catch (error) {
      throw error;
    }
  }

  async getAccounts(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingAccountOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const accounts = await this.prisma.acc_accounts.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_account: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = accounts.length > limit;
      if (hasNextPage) accounts.pop();

      const unifiedAccounts = await Promise.all(
        accounts.map(async (account) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: account.id_acc_account },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedAccount: UnifiedAccountingAccountOutput = {
            id: account.id_acc_account,
            name: account.name,
            description: account.description,
            classification: account.classification,
            type: account.type,
            status: account.status,
            current_balance: account.current_balance
              ? Number(account.current_balance)
              : undefined,
            currency: account.currency as CurrencyCode,
            account_number: account.account_number,
            parent_account: account.parent_account,
            company_info_id: account.id_acc_company_info,
            field_mappings: field_mappings,
            remote_id: account.remote_id,
            created_at: account.created_at,
            modified_at: account.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: account.id_acc_account },
            });
            unifiedAccount.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedAccount;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.account.pull',
          method: 'GET',
          url: '/accounting/accounts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedAccounts,
        next_cursor: hasNextPage
          ? accounts[accounts.length - 1].id_acc_account
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
