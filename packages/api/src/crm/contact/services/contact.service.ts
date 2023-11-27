import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { ApiResponse, ContactResponse, Email, Phone } from '../types';
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
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { decrypt } from '@@core/utils/crypto';
import axios from 'axios';
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

  /* utils functions */
  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    const normalizedEmails = email_addresses.map((email) => ({
      ...email,
      owner_type: email.owner_type ? email.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_contact_email: uuidv4(),
      email_address_type:
        email.email_address_type === '' ? 'work' : email.email_address_type,
    }));

    const normalizedPhones = phone_numbers.map((phone) => ({
      ...phone,
      owner_type: phone.owner_type ? phone.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      //id_crm_company: '1', //TODO
      //id_crm_contact: '1', //TODO
      id_crm_contacts_phone_number: uuidv4(),
      phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
    }));

    return {
      normalizedEmails,
      normalizedPhones,
    };
  }

  async addContactToDb(
    data: UnifiedContactInput,
    job_id: string,
    integrationId: string,
    linkedUserId: string,
    field_mappings?: Record<string, any>[],
  ) {
    const { first_name, last_name, email_addresses, phone_numbers } = data;
    const { normalizedEmails, normalizedPhones } =
      this.normalizeEmailsAndNumbers(email_addresses, phone_numbers);

    const resp = await this.prisma.crm_contacts.create({
      data: {
        id_crm_contact: uuidv4(),
        created_at: new Date(),
        modified_at: new Date(),
        first_name: first_name,
        last_name: last_name,
        crm_contact_email_addresses: {
          create: normalizedEmails,
        },
        crm_phone_numbers: {
          create: normalizedPhones,
        },
        id_job: job_id,
      },
    });

    //TODO: check why it doest iterate
    if (field_mappings && field_mappings.length > 0) {
      const entity = await this.prisma.entity.findFirst({
        where: { ressource_owner_id: 'contact' },
      });

      for (const mapping of field_mappings) {
        const attribute = await this.prisma.attribute.findFirst({
          where: {
            slug: Object.keys(mapping)[0],
            source: integrationId,
            id_consumer: linkedUserId,
            id_entity: entity.id_entity,
          },
        });

        if (attribute) {
          await this.prisma.value.create({
            data: {
              id_value: uuidv4(),
              data: Object.values(mapping)[0],
              id_attribute: attribute.id_attribute,
              id_entity: entity.id_entity,
            },
          });
        }
      }
    }
  }

  /* */

  async getCustomProperties(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(
        `https://api.hubapi.com/properties/v1/contacts/properties`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${decrypt(connection.access_token)}`,
          },
        },
      );
      return {
        data: resp.data,
        message: 'Hubspot contact properties retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.contact,
        ActionType.GET,
      );
    }
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    const job_resp_create = await this.prisma.jobs.create({
      data: {
        id_job: uuidv4(),
        id_linked_user: linkedUserId,
        status: 'initialized',
      },
    });
    const job_id = job_resp_create.id_job;
    //TODO: add field mappings data too
    await this.addContactToDb(
      unifiedContactData,
      job_id,
      integrationId,
      linkedUserId,
      unifiedContactData.field_mappings,
    );
    const job_resp_update = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: 'written',
      },
    });

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
    const status_resp = resp.statusCode === HttpStatus.OK ? 'success' : 'fail';
    const job_resp = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: status_resp,
      },
    });
    return { ...resp, data: res };
  }

  //TODO: insert data in the db (would be used as data lake and webooks syncs later)
  async getContacts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    const job_resp_create = await this.prisma.jobs.create({
      data: {
        id_job: uuidv4(),
        id_linked_user: linkedUserId,
        status: 'written',
      },
    });
    const job_id = job_resp_create.id_job;

    // get potential fieldMappings and extract the original properties name
    const customFieldMappings =
      await this.fieldMappingService.getCustomFieldMappings(
        integrationId,
        linkedUserId,
        'contact',
      );
    const remoteProperties: string[] = customFieldMappings.map(
      (mapping) => mapping.remote_id,
    );

    let resp: ApiResponse<OriginalContactOutput[]>;
    switch (integrationId) {
      case 'freshsales':
        resp = await this.freshsales.getContacts(linkedUserId);
        break;

      case 'zoho':
        resp = await this.zoho.getContacts(linkedUserId);
        break;

      case 'zendesk':
        resp = await this.zendesk.getContacts(linkedUserId);
        break;

      case 'hubspot':
        resp = await this.hubspot.getContacts(linkedUserId, remoteProperties);
        break;

      case 'pipedrive':
        resp = await this.pipedrive.getContacts(linkedUserId);
        break;

      default:
        break;
    }

    //TODO: insert the data in the DB with the fieldMappings (value table)

    const sourceObject: OriginalContactOutput[] = resp.data;
    //unify the data according to the target obj wanted
    const unifiedObject = (await unify<OriginalContactOutput[]>({
      sourceObject,
      targetType: CrmObject.contact,
      providerName: integrationId,
      customFieldMappings,
    })) as UnifiedContactOutput[];

    let res: ContactResponse = {
      contacts: unifiedObject,
    };

    if (remote_data) {
      res = {
        ...res,
        remote_data: sourceObject,
      };
    }

    const status_resp = resp.statusCode === HttpStatus.OK ? 'success' : 'fail';

    const job_resp = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: status_resp,
      },
    });
    return { ...resp, data: res };
  }
}
