import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingPhonenumberInput,
  UnifiedAccountingPhonenumberOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class PhoneNumberService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PhoneNumberService.name);
  }

  async getPhoneNumber(
    id_acc_phone_number: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPhonenumberOutput> {
    try {
      const phoneNumber = await this.prisma.acc_phone_numbers.findUnique({
        where: { id_acc_phone_number: id_acc_phone_number },
      });

      if (!phoneNumber) {
        throw new Error(
          `Phone number with ID ${id_acc_phone_number} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: phoneNumber.id_acc_phone_number },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedPhoneNumber: UnifiedAccountingPhonenumberOutput = {
        id: phoneNumber.id_acc_phone_number,
        number: phoneNumber.number,
        type: phoneNumber.type,
        company_info_id: phoneNumber.id_acc_company_info,
        contact_id: phoneNumber.id_acc_contact,
        field_mappings: field_mappings,
        created_at: phoneNumber.created_at,
        modified_at: phoneNumber.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: phoneNumber.id_acc_phone_number },
        });
        unifiedPhoneNumber.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.phone_number.pull',
          method: 'GET',
          url: '/accounting/phone_number',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedPhoneNumber;
    } catch (error) {
      throw error;
    }
  }

  async getPhoneNumbers(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingPhonenumberOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const phoneNumbers = await this.prisma.acc_phone_numbers.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_phone_number: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = phoneNumbers.length > limit;
      if (hasNextPage) phoneNumbers.pop();

      const unifiedPhoneNumbers = await Promise.all(
        phoneNumbers.map(async (phoneNumber) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: phoneNumber.id_acc_phone_number },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedPhoneNumber: UnifiedAccountingPhonenumberOutput = {
            id: phoneNumber.id_acc_phone_number,
            number: phoneNumber.number,
            type: phoneNumber.type,
            company_info_id: phoneNumber.id_acc_company_info,
            contact_id: phoneNumber.id_acc_contact,
            field_mappings: field_mappings,
            created_at: phoneNumber.created_at,
            modified_at: phoneNumber.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: phoneNumber.id_acc_phone_number },
            });
            unifiedPhoneNumber.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedPhoneNumber;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.phone_number.pull',
          method: 'GET',
          url: '/accounting/phone_numbers',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedPhoneNumbers,
        next_cursor: hasNextPage
          ? phoneNumbers[phoneNumbers.length - 1].id_acc_phone_number
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
