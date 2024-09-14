import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingPhonenumberOutput } from '../types/model.unified';
import { IPhoneNumberService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_phone_numbers as AccPhoneNumber } from '@prisma/client';
import { OriginalPhoneNumberOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'phonenumber', this);
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
      const service: IPhoneNumberService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingPhonenumberOutput,
        OriginalPhoneNumberOutput,
        IPhoneNumberService
      >(integrationId, linkedUserId, 'accounting', 'phone_number', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    phoneNumbers: UnifiedAccountingPhonenumberOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccPhoneNumber[]> {
    try {
      const phoneNumberResults: AccPhoneNumber[] = [];

      for (let i = 0; i < phoneNumbers.length; i++) {
        const phoneNumber = phoneNumbers[i];
        const originId = phoneNumber.remote_id;

        let existingPhoneNumber = await this.prisma.acc_phone_numbers.findFirst(
          {
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          },
        );

        const phoneNumberData = {
          number: phoneNumber.number,
          type: phoneNumber.type,
          id_acc_company_info: phoneNumber.company_info_id,
          id_acc_contact: phoneNumber.contact_id,
          modified_at: new Date(),
        };

        if (existingPhoneNumber) {
          existingPhoneNumber = await this.prisma.acc_phone_numbers.update({
            where: {
              id_acc_phone_number: existingPhoneNumber.id_acc_phone_number,
            },
            data: phoneNumberData,
          });
        } else {
          existingPhoneNumber = await this.prisma.acc_phone_numbers.create({
            data: {
              ...phoneNumberData,
              id_acc_phone_number: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        phoneNumberResults.push(existingPhoneNumber);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          phoneNumber.field_mappings,
          existingPhoneNumber.id_acc_phone_number,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingPhoneNumber.id_acc_phone_number,
          remote_data[i],
        );
      }

      return phoneNumberResults;
    } catch (error) {
      throw error;
    }
  }
}
