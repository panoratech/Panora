import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { ApiResponse, ContactResponse, Email, Phone } from '../types';
import { desunify } from 'src/@core/utils/unification/desunify';
import {
  CrmObject,
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from 'src/crm/@types';
import { LoggerService } from 'src/@core/logger/logger.service';
import { unify } from 'src/@core/utils/unification/unify';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';
import { OriginalContactOutput } from 'src/@core/utils/types';

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
      id_crm_company: '1', //TODO
      id_crm_contact: '1', //TODO
      id_crm_contacts_phone_number: uuidv4(),
      phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
    }));

    return {
      normalizedEmails,
      normalizedPhones,
    };
  }

  async addContactToDb(data: UnifiedContactInput, job_id: string) {
    const { first_name, last_name, email_addresses, phone_numbers } = data;
    const { normalizedEmails, normalizedPhones } =
      this.normalizeEmailsAndNumbers(email_addresses, phone_numbers);

    const resp = await this.prisma.crm_contacts.create({
      data: {
        id_crm_contact: '1',
        created_at: new Date(),
        modified_at: new Date(),
        first_name: first_name,
        last_name: last_name,
        crm_contact_email_addresses: {
          create: normalizedEmails,
        },
        crm_contacts_phone_numbers: {
          create: normalizedPhones,
        },
        id_job: job_id,
      },
    });
  }

  // Helper method to apply custom field mappings to the contact data
  applyCustomFieldMappings(contactData, customFieldMappings) {
    // Logic to transform the contactData by applying the customFieldMappings
    // For each custom field mapping, replace or add the field in contactData
    customFieldMappings.forEach((mapping) => {
      // Assuming mapping has `unifiedFieldName` and `providerFieldName`
      if (contactData.hasOwnProperty(mapping.unifiedFieldName)) {
        contactData[mapping.providerFieldName] =
          contactData[mapping.unifiedFieldName];
        // Optionally remove the unified field if it should not be sent to the provider
        // delete contactData[mapping.unifiedFieldName];
      }
    });
    return contactData;
  }

  /* */

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
    await this.addContactToDb(unifiedContactData, job_id);
    const job_resp_update = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: 'written',
      },
    });

    // TODO: check if for contact object and provider there is a field mapping
    // Retrieve custom field mappings
    /*const customFieldMappings =
      await this.fieldMappingService.getCustomFieldMappings(
        integrationId,
        linkedUserId,
      );*/

    let resp: ApiResponse<OriginalContactOutput>;
    //desunify the data according to the target obj wanted
    const desunifiedObject = await desunify<UnifiedContactInput>({
      sourceObject: unifiedContactData,
      targetType: CrmObject.contact,
      providerName: integrationId,
    });

    //TODO
    /*desunifiedObject = this.applyCustomFieldMappings(
      desunifiedObject,
      customFieldMappings,
    );*/

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
        resp = await this.hubspot.getContacts(linkedUserId);
        break;

      case 'pipedrive':
        resp = await this.pipedrive.getContacts(linkedUserId);
        break;

      default:
        break;
    }
    const sourceObject: OriginalContactOutput[] = resp.data;

    //unify the data according to the target obj wanted
    const unifiedObject = (await unify<OriginalContactOutput[]>({
      sourceObject,
      targetType: CrmObject.contact,
      providerName: integrationId,
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
