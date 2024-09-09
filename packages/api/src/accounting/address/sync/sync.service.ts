import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingAddressOutput } from '../types/model.unified';
import { IAddressService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_addresses as AccAddress } from '@prisma/client';
import { OriginalAddressOutput } from '@@core/utils/types/original/original.accounting';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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
    this.registry.registerService('accounting', 'address', this);
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
      const service: IAddressService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingAddressOutput,
        OriginalAddressOutput,
        IAddressService
      >(integrationId, linkedUserId, 'accounting', 'address', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    addresses: UnifiedAccountingAddressOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccAddress[]> {
    try {
      const addressResults: AccAddress[] = [];

      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const originId = address.remote_id;

        let existingAddress = await this.prisma.acc_addresses.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const addressData = {
          type: address.type,
          street_1: address.street_1,
          street_2: address.street_2,
          city: address.city,
          state: address.state,
          country_subdivision: address.country_subdivision,
          country: address.country,
          zip: address.zip,
          id_acc_contact: address.contact_id,
          id_acc_company_info: address.company_info_id,
          modified_at: new Date(),
        };

        if (existingAddress) {
          existingAddress = await this.prisma.acc_addresses.update({
            where: { id_acc_address: existingAddress.id_acc_address },
            data: addressData,
          });
        } else {
          existingAddress = await this.prisma.acc_addresses.create({
            data: {
              ...addressData,
              id_acc_address: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        addressResults.push(existingAddress);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          address.field_mappings,
          existingAddress.id_acc_address,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingAddress.id_acc_address,
          remote_data[i],
        );
      }

      return addressResults;
    } catch (error) {
      throw error;
    }
  }
}
