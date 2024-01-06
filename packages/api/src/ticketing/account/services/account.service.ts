import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
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
  ): Promise<AccountResponse> {
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
        name: account.name,
        domains: account.domains,
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

      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getAccounts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<AccountResponse> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      const accounts = await this.prisma.tcg_accounts.findMany({
        where: {
          remote_id: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
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
            name: account.name,
            domains: account.domains,
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
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.account.pull',
          method: 'GET',
          url: '/ticketing/account',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
