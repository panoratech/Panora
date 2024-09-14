import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalContactOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_contacts as TicketingContact } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IContactService } from '../types';
import { UnifiedTicketingContactOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'contact', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
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
          const providers = TICKETING_PROVIDERS;
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, account_id, wh_real_time_trigger } =
        data;
      const service: IContactService =
        this.serviceRegistry.getService(integrationId);

      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: contact} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingContactOutput,
        OriginalContactOutput,
        IContactService
      >(
        integrationId,
        linkedUserId,
        'ticketing',
        'contact',
        service,
        [],
        wh_real_time_trigger,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    contacts: UnifiedTicketingContactOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    account_id?: string,
  ): Promise<TicketingContact[]> {
    try {
      const contacts_results: TicketingContact[] = [];

      const updateOrCreateContact = async (
        contact: UnifiedTicketingContactOutput,
        originId: string,
        connection_id: string,
      ) => {
        const existingContact = await this.prisma.tcg_contacts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: contact.name ?? null,
          email_address: contact.email_address ?? null,
          phone_number: contact.phone_number ?? null,
          details: contact.details ?? null,
          id_tcg_account: account_id ?? null,
          modified_at: new Date(),
        };

        if (existingContact) {
          return await this.prisma.tcg_contacts.update({
            where: {
              id_tcg_contact: existingContact.id_tcg_contact,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_contacts.create({
            data: {
              ...baseData,
              id_tcg_contact: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = contact.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateContact(
          contact,
          originId,
          connection_id,
        );
        const contact_id = res.id_tcg_contact;
        contacts_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          contact.field_mappings,
          contact_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(contact_id, remote_data[i]);
      }
      return contacts_results;
    } catch (error) {
      throw error;
    }
  }

  async removeInDb(connection_id: string, remote_id: string) {
    const existingContact = await this.prisma.tcg_contacts.findFirst({
      where: {
        remote_id: remote_id,
        id_connection: connection_id,
      },
    });
    await this.prisma.tcg_contacts.delete({
      where: {
        id_tcg_contact: existingContact.id_tcg_contact,
      },
    });
  }
}
