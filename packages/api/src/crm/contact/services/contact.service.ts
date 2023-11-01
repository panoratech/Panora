import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import {
  ApiResponse,
  Email,
  FreshSales_ContactCreated,
  Hubspot_ContactCreated,
  NormalizedContactInfo,
  Phone,
  Pipedrive_ContactCreated,
  Zendesk_ContactCreated,
  Zoho_ContactCreated,
} from '../types';

type AddContactResponse =
  | FreshSales_ContactCreated
  | Hubspot_ContactCreated
  | Zendesk_ContactCreated
  | Pipedrive_ContactCreated
  | Zoho_ContactCreated;

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    public freshsales: FreshSalesService,
    public hubspot: HubspotService,
    public zoho: ZohoService,
    public zendesk: ZendeskService,
    public pipedrive: PipedriveService,
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

  async addContactToDb(data: CreateContactDto, job_id: number | bigint) {
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
        id_job: job_id,
      },
    });
  }

  async addContact(createContactDto: CreateContactDto, integrationId: string) {
    const job_resp_create = await this.prisma.jobs.create({
      data: {
        status: 'initialized',
      },
    });
    const job_id = job_resp_create.id_job;
    await this.addContactToDb(createContactDto, job_id);
    const job_resp_update = await this.prisma.jobs.update({
      where: {
        id_job: job_id,
      },
      data: {
        status: 'written',
      },
    });

    //TODO: get the destination provider => call destinationCRMInDb()
    const dest: any = 'freshsales';
    let resp: ApiResponse<AddContactResponse>;
    switch (dest) {
      case 'freshsales':
        resp = await this.freshsales.addContact(createContactDto);
        break;

      case 'zoho':
        resp = await this.zoho.addContact(createContactDto);
        break;

      case 'zendesk':
        resp = await this.zendesk.addContact(createContactDto);
        break;

      case 'hubspot':
        resp = await this.hubspot.addContact(createContactDto);
        break;

      case 'pipedrive':
        resp = await this.pipedrive.addContact(createContactDto);
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
