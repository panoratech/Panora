import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Injectable } from '@nestjs/common';
import { UnifiedHrisBankinfoOutput } from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BankInfoService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BankInfoService.name);
  }

  async getBankinfo(
    id_hris_bank_info: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisBankinfoOutput> {
    try {
      const bankInfo = await this.prisma.hris_bank_infos.findUnique({
        where: { id_hris_bank_info: id_hris_bank_info },
      });

      if (!bankInfo) {
        throw new Error(`Bank info with ID ${id_hris_bank_info} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: bankInfo.id_hris_bank_info },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedBankInfo: UnifiedHrisBankinfoOutput = {
        id: bankInfo.id_hris_bank_info,
        account_type: bankInfo.account_type,
        bank_name: bankInfo.bank_name,
        account_number: bankInfo.account_number,
        routing_number: bankInfo.routing_number,
        employee_id: bankInfo.id_hris_employee,
        field_mappings: field_mappings,
        remote_id: bankInfo.remote_id,
        remote_created_at: bankInfo.remote_created_at,
        created_at: bankInfo.created_at,
        modified_at: bankInfo.modified_at,
        remote_was_deleted: bankInfo.remote_was_deleted,
      };

      const res: UnifiedHrisBankinfoOutput = unifiedBankInfo;

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: bankInfo.id_hris_bank_info },
        });
        res.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.bankinfo.pull',
          method: 'GET',
          url: '/hris/bankinfo',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getBankinfos(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisBankinfoOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const bankInfos = await this.prisma.hris_bank_infos.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_bank_info: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = bankInfos.length > limit;
      if (hasNextPage) bankInfos.pop();

      const unifiedBankInfos = await Promise.all(
        bankInfos.map(async (bankInfo) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: bankInfo.id_hris_bank_info },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedBankInfo: UnifiedHrisBankinfoOutput = {
            id: bankInfo.id_hris_bank_info,
            account_type: bankInfo.account_type,
            bank_name: bankInfo.bank_name,
            account_number: bankInfo.account_number,
            routing_number: bankInfo.routing_number,
            employee_id: bankInfo.id_hris_employee,
            field_mappings: field_mappings,
            remote_id: bankInfo.remote_id,
            remote_created_at: bankInfo.remote_created_at,
            created_at: bankInfo.created_at,
            modified_at: bankInfo.modified_at,
            remote_was_deleted: bankInfo.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: bankInfo.id_hris_bank_info },
            });
            unifiedBankInfo.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedBankInfo;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.bankinfo.pull',
          method: 'GET',
          url: '/hris/bankinfos',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedBankInfos,
        next_cursor: hasNextPage
          ? bankInfos[bankInfos.length - 1].id_hris_bank_info
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
