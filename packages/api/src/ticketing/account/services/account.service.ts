import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { UnifiedAccountOutput } from '../types/model.unified';
import { AccountResponse } from '../types';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(AccountService.name);
  }

  async getAccount(
    id_ticketing_account: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AccountResponse>> {
    try {
      const account = await this.prisma.tcg_accounts.findUnique({
        where: {
          id_tcg_account: id_ticketing_account,
        },
      });

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: account.id_tcg_account,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedAccountOutput format
      const unifiedAccount: UnifiedAccountOutput = {
        id: account.id_tcg_account,
        email_address: account.email_address,
        name: account.name,
        teams: account.teams,
        field_mappings: field_mappings,
      };

      let res: AccountResponse = {
        accounts: [unifiedAccount],
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: account.id_tcg_account,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: [remote_data],
        };
      }

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getAccounts(
    integrationId: string,
    linkedAccountId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<AccountResponse>> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.account.pull',
          method: 'GET',
          url: '/ticketing/account',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedAccountId,
        },
      });
      const job_id = job_resp_create.id_event;
      const accounts = await this.prisma.tcg_accounts.findMany({
        where: {
          remote_id: integrationId.toLowerCase(),
          events: {
            id_linked_user: linkedAccountId,
          },
        },
      });

      const unifiedAccounts: UnifiedAccountOutput[] = await Promise.all(
        accounts.map(async (account) => {
          // Fetch field mappings for the account
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: account.id_tcg_account,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedAccountOutput format
          return {
            id: account.id_tcg_account,
            email_address: account.email_address,
            name: account.name,
            teams: account.teams,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: AccountResponse = {
        accounts: unifiedAccounts,
      };

      if (remote_data) {
        const remote_array_data: Record<string, any>[] = await Promise.all(
          accounts.map(async (account) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: account.id_tcg_account,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return remote_data;
          }),
        );

        res = {
          ...res,
          remote_data: remote_array_data,
        };
      }
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
