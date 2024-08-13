import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingAddressInput,
  UnifiedAccountingAddressOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AddressService.name);
  }

  async getAddress(
    id_acc_address: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingAddressOutput> {
    try {
      const address = await this.prisma.acc_addresses.findUnique({
        where: { id_acc_address: id_acc_address },
      });

      if (!address) {
        throw new Error(`Address with ID ${id_acc_address} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: address.id_acc_address },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedAddress: UnifiedAccountingAddressOutput = {
        id: address.id_acc_address,
        type: address.type,
        street_1: address.street_1,
        street_2: address.street_2,
        city: address.city,
        state: address.state,
        country_subdivision: address.country_subdivision,
        country: address.country,
        zip: address.zip,
        contact_id: address.id_acc_contact,
        company_info_id: address.id_acc_company_info,
        field_mappings: field_mappings,
        created_at: address.created_at,
        modified_at: address.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: address.id_acc_address },
        });
        unifiedAddress.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.address.pull',
          method: 'GET',
          url: '/accounting/address',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedAddress;
    } catch (error) {
      throw error;
    }
  }

  async getAddresss(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingAddressOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const addresses = await this.prisma.acc_addresses.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_address: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = addresses.length > limit;
      if (hasNextPage) addresses.pop();

      const unifiedAddresses = await Promise.all(
        addresses.map(async (address) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: address.id_acc_address },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedAddress: UnifiedAccountingAddressOutput = {
            id: address.id_acc_address,
            type: address.type,
            street_1: address.street_1,
            street_2: address.street_2,
            city: address.city,
            state: address.state,
            country_subdivision: address.country_subdivision,
            country: address.country,
            zip: address.zip,
            contact_id: address.id_acc_contact,
            company_info_id: address.id_acc_company_info,
            field_mappings: field_mappings,
            created_at: address.created_at,
            modified_at: address.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: address.id_acc_address },
            });
            unifiedAddress.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedAddress;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.address.pull',
          method: 'GET',
          url: '/accounting/addresses',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedAddresses,
        next_cursor: hasNextPage
          ? addresses[addresses.length - 1].id_acc_address
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
