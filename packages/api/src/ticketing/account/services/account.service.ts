import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAccountOutput } from '../types/model.unified';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(AccountService.name);
  }

  async getAccount(
    id_ticketing_account: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountOutput> {
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

      let res: UnifiedAccountOutput = unifiedAccount;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: account.id_tcg_account,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getAccounts(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_accounts.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_account: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const accounts = await this.prisma.tcg_accounts.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_account: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (accounts.length === limit + 1) {
        next_cursor = Buffer.from(
          accounts[accounts.length - 1].id_tcg_account,
        ).toString('base64');
        accounts.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

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

      let res: UnifiedAccountOutput[] = unifiedAccounts;

      if (remote_data) {
        const remote_array_data: UnifiedAccountOutput[] = await Promise.all(
          res.map(async (account) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: account.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...account, remote_data };
          }),
        );

        res = remote_array_data;
      }
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.account.pull',
          method: 'GET',
          url: '/ticketing/accounts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
