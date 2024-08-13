import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisTimeoffbalanceOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TimeoffBalanceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimeoffBalanceService.name);
  }

  async getTimeoffBalance(
    id_hris_time_off_balance: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisTimeoffbalanceOutput> {
    try {
      const timeOffBalance =
        await this.prisma.hris_time_off_balances.findUnique({
          where: { id_hris_time_off_balance: id_hris_time_off_balance },
        });

      if (!timeOffBalance) {
        throw new Error(
          `Time off balance with ID ${id_hris_time_off_balance} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: timeOffBalance.id_hris_time_off_balance,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedTimeOffBalance: UnifiedHrisTimeoffbalanceOutput = {
        id: timeOffBalance.id_hris_time_off_balance,
        balance: timeOffBalance.balance
          ? Number(timeOffBalance.balance)
          : undefined,
        employee_id: timeOffBalance.id_hris_employee,
        used: timeOffBalance.used ? Number(timeOffBalance.used) : undefined,
        policy_type: timeOffBalance.policy_type,
        field_mappings: field_mappings,
        remote_id: timeOffBalance.remote_id,
        remote_created_at: timeOffBalance.remote_created_at,
        created_at: timeOffBalance.created_at,
        modified_at: timeOffBalance.modified_at,
        remote_was_deleted: timeOffBalance.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: timeOffBalance.id_hris_time_off_balance,
          },
        });
        unifiedTimeOffBalance.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.time_off_balance.pull',
          method: 'GET',
          url: '/hris/time_off_balance',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedTimeOffBalance;
    } catch (error) {
      throw error;
    }
  }

  async getTimeoffBalances(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisTimeoffbalanceOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const timeOffBalances = await this.prisma.hris_time_off_balances.findMany(
        {
          take: limit + 1,
          cursor: cursor ? { id_hris_time_off_balance: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
        },
      );

      const hasNextPage = timeOffBalances.length > limit;
      if (hasNextPage) timeOffBalances.pop();

      const unifiedTimeOffBalances = await Promise.all(
        timeOffBalances.map(async (timeOffBalance) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: timeOffBalance.id_hris_time_off_balance,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedTimeOffBalance: UnifiedHrisTimeoffbalanceOutput = {
            id: timeOffBalance.id_hris_time_off_balance,
            balance: timeOffBalance.balance
              ? Number(timeOffBalance.balance)
              : undefined,
            employee_id: timeOffBalance.id_hris_employee,
            used: timeOffBalance.used ? Number(timeOffBalance.used) : undefined,
            policy_type: timeOffBalance.policy_type,
            field_mappings: field_mappings,
            remote_id: timeOffBalance.remote_id,
            remote_created_at: timeOffBalance.remote_created_at,
            created_at: timeOffBalance.created_at,
            modified_at: timeOffBalance.modified_at,
            remote_was_deleted: timeOffBalance.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: timeOffBalance.id_hris_time_off_balance,
              },
            });
            unifiedTimeOffBalance.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedTimeOffBalance;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.time_off_balance.pull',
          method: 'GET',
          url: '/hris/time_off_balances',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedTimeOffBalances,
        next_cursor: hasNextPage
          ? timeOffBalances[timeOffBalances.length - 1].id_hris_time_off_balance
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
