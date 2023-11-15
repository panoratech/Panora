import { HttpStatus, Injectable } from '@nestjs/common';
import { UnifiedContactInput } from '../dto/create-contact.dto';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { ApiResponse, Email, NormalizedContactInfo, Phone } from '../types';
import { desunify } from 'src/@core/utils/unification';
import {
  CrmObject,
  FreshsalesContactInput,
  FreshsalesContactOutput,
  HubspotContactInput,
  HubspotContactOutput,
  PipedriveContactInput,
  PipedriveContactOutput,
  ZendeskContactInput,
  ZendeskContactOutput,
  ZohoContactInput,
  ZohoContactOutput,
} from 'src/crm/@types';

export type ContactOutput =
  | FreshsalesContactOutput
  | HubspotContactOutput
  | ZohoContactOutput
  | ZendeskContactOutput
  | PipedriveContactOutput;

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private freshsales: FreshSalesService,
    private hubspot: HubspotService,
    private zoho: ZohoService,
    private zendesk: ZendeskService,
    private pipedrive: PipedriveService,
  ) {}

  //utils functions
  normalizeEmailsAndNumbers(
    email_addresses: Email[],
    phone_numbers: Phone[],
  ): NormalizedContactInfo {
    const normalizedEmails = email_addresses.map((email) => ({
      ...email,
      email_address_type:
        email.email_address_type === '' ? 'work' : email.email_address_type,
    }));

    const normalizedPhones = phone_numbers.map((phone) => ({
      ...phone,
      phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
    }));

    return {
      normalizedEmails,
      normalizedPhones,
    };
  }

  async addContactToDb(data: UnifiedContactInput, job_id: number | bigint) {
    const { first_name, last_name, email_addresses, phone_numbers } = data;
    const { normalizedEmails, normalizedPhones } =
      this.normalizeEmailsAndNumbers(email_addresses, phone_numbers);

    const resp = await this.prisma.crm_contacts.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        crm_contact_email_addresses: {
          create: normalizedEmails,
        },
        crm_contacts_phone_numbers: {
          create: normalizedPhones,
        },
        id_job: job_id as number,
      },
    });
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
  ) {
    const job_resp_create = await this.prisma.jobs.create({
      data: {
        id_linked_user: BigInt(linkedUserId),
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

    let resp: ApiResponse<ContactOutput>;
    //desunify the data according to the target obj wanted
    const desunifiedObject = await desunify<UnifiedContactInput>({
      sourceObject: unifiedContactData,
      targetType: CrmObject.contact,
      providerName: integrationId,
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

    //TODO: sanitize the resp to normalize it
    const status_resp = resp.statusCode === HttpStatus.OK ? 'success' : 'fail';
    const job_resp = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: status_resp,
      },
    });
    return resp;
  }
}
