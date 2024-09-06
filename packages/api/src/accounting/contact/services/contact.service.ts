import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { CurrencyCode } from '@@core/utils/types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingContactInput,
  UnifiedAccountingContactOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ContactService.name);
  }

  async addContact(
    unifiedContactData: UnifiedAccountingContactInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingContactOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addContact(unifiedContactData, linkedUserId);

      const savedContact = await this.prisma.acc_contacts.create({
        data: {
          id_acc_contact: uuidv4(),
          ...unifiedContactData,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      const result: UnifiedAccountingContactOutput = {
        ...savedContact,
        currency: savedContact.currency as CurrencyCode,
        id: savedContact.id_acc_contact,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getContact(
    id_acc_contact: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingContactOutput> {
    try {
      const contact = await this.prisma.acc_contacts.findUnique({
        where: { id_acc_contact: id_acc_contact },
      });

      if (!contact) {
        throw new Error(`Contact with ID ${id_acc_contact} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: contact.id_acc_contact },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedContact: UnifiedAccountingContactOutput = {
        id: contact.id_acc_contact,
        name: contact.name,
        is_supplier: contact.is_supplier,
        is_customer: contact.is_customer,
        email_address: contact.email_address,
        tax_number: contact.tax_number,
        status: contact.status,
        currency: contact.currency as CurrencyCode,
        remote_updated_at: contact.remote_updated_at || null,
        company_info_id: contact.id_acc_company_info,
        field_mappings: field_mappings,
        remote_id: contact.remote_id,
        created_at: contact.created_at,
        modified_at: contact.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: contact.id_acc_contact },
        });
        unifiedContact.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.contact.pull',
          method: 'GET',
          url: '/accounting/contact',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedContact;
    } catch (error) {
      throw error;
    }
  }

  async getContacts(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingContactOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const contacts = await this.prisma.acc_contacts.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_contact: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = contacts.length > limit;
      if (hasNextPage) contacts.pop();

      const unifiedContacts = await Promise.all(
        contacts.map(async (contact) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: contact.id_acc_contact },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedContact: UnifiedAccountingContactOutput = {
            id: contact.id_acc_contact,
            name: contact.name,
            is_supplier: contact.is_supplier,
            is_customer: contact.is_customer,
            email_address: contact.email_address,
            tax_number: contact.tax_number,
            status: contact.status,
            currency: contact.currency as CurrencyCode,
            remote_updated_at: contact.remote_updated_at || null,
            company_info_id: contact.id_acc_company_info,
            field_mappings: field_mappings,
            remote_id: contact.remote_id,
            created_at: contact.created_at,
            modified_at: contact.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: contact.id_acc_contact },
            });
            unifiedContact.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedContact;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.contact.pull',
          method: 'GET',
          url: '/accounting/contacts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedContacts,
        next_cursor: hasNextPage
          ? contacts[contacts.length - 1].id_acc_contact
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
