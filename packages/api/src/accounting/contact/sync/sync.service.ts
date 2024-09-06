import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingContactOutput } from '../types/model.unified';
import { IContactService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_contacts as AccContact } from '@prisma/client';
import { OriginalContactOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'contact', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing accounting contacts...');
      const users = user_id
        ? [await this.prisma.users.findUnique({ where: { id_user: user_id } })]
        : await this.prisma.users.findMany();

      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: { id_user: user.id_user },
          });
          for (const project of projects) {
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: { id_project: project.id_project },
            });
            for (const linkedUser of linkedUsers) {
              for (const provider of ACCOUNTING_PROVIDERS) {
                await this.syncForLinkedUser({
                  integrationId: provider,
                  linkedUserId: linkedUser.id_linked_user,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingContactOutput,
        OriginalContactOutput,
        IContactService
      >(integrationId, linkedUserId, 'accounting', 'contact', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    contacts: UnifiedAccountingContactOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccContact[]> {
    try {
      const contactResults: AccContact[] = [];

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = contact.remote_id;

        let existingContact = await this.prisma.acc_contacts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const contactData = {
          name: contact.name,
          is_supplier: contact.is_supplier,
          is_customer: contact.is_customer,
          email_address: contact.email_address,
          tax_number: contact.tax_number,
          status: contact.status,
          currency: contact.currency as CurrencyCode,
          remote_updated_at: contact.remote_updated_at,
          id_acc_company_info: contact.company_info_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingContact) {
          existingContact = await this.prisma.acc_contacts.update({
            where: { id_acc_contact: existingContact.id_acc_contact },
            data: contactData,
          });
        } else {
          existingContact = await this.prisma.acc_contacts.create({
            data: {
              ...contactData,
              id_acc_contact: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        contactResults.push(existingContact);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          contact.field_mappings,
          existingContact.id_acc_contact,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingContact.id_acc_contact,
          remote_data[i],
        );
      }

      return contactResults;
    } catch (error) {
      throw error;
    }
  }
}
