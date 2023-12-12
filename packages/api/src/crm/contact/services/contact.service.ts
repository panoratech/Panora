import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { ApiResponse, ContactResponse } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import {
  CrmObject,
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from 'src/crm/@types';
import { LoggerService } from '@@core/logger/logger.service';
import { unify } from '@@core/utils/unification/unify';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';
import { OriginalContactOutput } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private freshsales: FreshSalesService,
    private hubspot: HubspotService,
    private zoho: ZohoService,
    private zendesk: ZendeskService,
    private pipedrive: PipedriveService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
  ) {
    this.logger.setContext(ContactService.name);
  }

  async batchAddContacts(
    unifiedContactData: UnifiedContactInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    try {
      const responses = await Promise.all(
        unifiedContactData.map((unifiedData) =>
          this.addContact(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      const allContacts = responses.flatMap(
        (response) => response.data.contacts,
      );
      const allRemoteData = responses.flatMap(
        (response) => response.data.remote_data || [],
      );

      return {
        data: {
          contacts: allContacts,
          remote_data: allRemoteData,
        },
        message: 'All contacts inserted successfully',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    try {
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'push', //sync, push or pull
          method: 'POST',
          url: '/crm/contact',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;

      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'contact',
        );
      let resp: ApiResponse<OriginalContactOutput>;
      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<UnifiedContactInput>({
        sourceObject: unifiedContactData,
        targetType: CrmObject.contact,
        providerName: integrationId,
        customFieldMappings: unifiedContactData.field_mappings
          ? customFieldMappings
          : [],
      });

      switch (integrationId) {
        case 'freshsales':
          resp = await this.freshsales.addContact(
            desunifiedObject as FreshsalesContactInput,
            linkedUserId,
          );
          break;

        case 'zoho':
          resp = await this.zoho.addContact(
            desunifiedObject as ZohoContactInput,
            linkedUserId,
          );
          break;

        case 'zendesk':
          resp = await this.zendesk.addContact(
            desunifiedObject as ZendeskContactInput,
            linkedUserId,
          );
          break;

        case 'hubspot':
          resp = await this.hubspot.addContact(
            desunifiedObject as HubspotContactInput,
            linkedUserId,
          );
          break;

        case 'pipedrive':
          resp = await this.pipedrive.addContact(
            desunifiedObject as PipedriveContactInput,
            linkedUserId,
          );
          break;

        default:
          break;
      }
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalContactOutput[]>({
        sourceObject: [resp.data],
        targetType: CrmObject.contact,
        providerName: integrationId,
        customFieldMappings: customFieldMappings,
      })) as UnifiedContactOutput[];

      let res: ContactResponse = {
        contacts: unifiedObject,
      };

      if (remote_data) {
        res = {
          ...res,
          remote_data: [resp.data],
        };
      }
      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: status_resp,
        },
      });
      return { ...resp, data: res };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getContacts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    try {
      // handle case for remote data too
      //TODO: handle case where data is not there (not synced) or old synced
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'pull',
          method: 'GET',
          url: '/crm/contact',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;
      const contacts = await this.prisma.crm_contacts.findMany({
        where: {
          origin: integrationId.toLowerCase(),
          events: {
            id_linked_user: linkedUserId,
          },
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
        },
      });

      const unifiedContacts: UnifiedContactOutput[] = await Promise.all(
        contacts.map(async (contact) => {
          // Fetch field mappings for the contact
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: contact.id_crm_contact,
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

          // Transform to UnifiedContactInput format
          return {
            first_name: contact.first_name,
            last_name: contact.last_name,
            email_addresses: contact.crm_email_addresses.map((email) => ({
              email_address: email.email_address,
              email_address_type: email.email_address_type,
            })),
            phone_numbers: contact.crm_phone_numbers.map((phone) => ({
              phone_number: phone.phone_number,
              phone_type: phone.phone_type,
            })),
            field_mappings: field_mappings,
          };
        }),
      );

      const res: ContactResponse = {
        contacts: unifiedContacts,
      };

      //TODO
      /*if (remote_data) {
        const resp = await this.prisma.remote_data
      
        res = {
          ...res,
          remote_data: [resp.data],
        };
      }*/
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  //TODO
  async updateContact(
    id: string,
    updateContactData: Partial<UnifiedContactInput>,
  ): Promise<ApiResponse<ContactResponse>> {
    try {
    } catch (error) {
      handleServiceError(error, this.logger);
    }
    // TODO: fetch the contact from the database using 'id'
    // TODO: update the contact with 'updateContactData'
    // TODO: save the updated contact back to the database
    // TODO: return the updated contact
    return;
  }
}
