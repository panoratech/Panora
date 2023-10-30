import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiResponse,
  FreshSales_ContactCreated,
  Hubspot_ContactCreated,
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
  async addContactToDb(data: CreateContactDto, job_uuid: string) {
    const { first_name, last_name, email_addresses, phone_numbers } = data;
    const uuid_crm_contact = uuidv4();
    const resp = await this.prisma.crm_contacts.create({
      data: {
        id_crm_contact: 10,
        uuid_crm_contact: uuid_crm_contact,
        first_name: first_name,
        last_name: last_name,
        // TODO: job_uuid: job_uuid,
      },
    });
    for (const mail of email_addresses) {
      const resp_mail = await this.prisma.crm_contact_email_addresses.create({
        data: {
          id_crm_contact_email: 1,
          uuid_crm_contact_email: uuidv4(),
          uuid_crm_contact: uuid_crm_contact,
          email_address: mail,
          email_address_type: '',
        },
      });
    }
    for (const mobile of phone_numbers) {
      const resp_mobile = await this.prisma.crm_contacts_phone_numbers.create({
        data: {
          id_crm_contacts_phone_number: 1,
          uuid_crm_contacts_phone_number: uuidv4(),
          uuid_crm_contact: uuid_crm_contact,
          phone: mobile,
          phone_type: '',
        },
      });
    }
  }

  async addContact(createContactDto: CreateContactDto, integrationId: string) {
    const job_uuid = uuidv4();
    /* TODO: const job_resp_create = await this.prisma.jobs.create({
      data: {
        status: 'initialized'
      }
    })*/
    await this.addContactToDb(createContactDto, job_uuid);
    /* TODO: const job_resp_update = await this.prisma.jobs.update({
      data: {
        status: 'written'
      }, where: {
        job_uuid: job_uuid
      }
    })*/

    //TODO: get the destination provider => call destinationCRMInDb()
    const dest: any = 'freshsales';
    let resp: ApiResponse<AddContactResponse>;
    switch (dest) {
      case 'freshsales':
        resp = await this.freshsales.addContact(createContactDto);
        break;

      case 'zoho':
        resp = await this.zoho.addContact();
        break;

      case 'zendesk':
        resp = await this.zendesk.addContact();
        break;

      case 'hubspot':
        resp = await this.hubspot.addContact();
        break;

      case 'pipedrive':
        resp = await this.pipedrive.addContact();
        break;

      default:
        break;
    }
    //TODO: sanitize the resp to normalize it

    const status_resp = resp.statusCode === HttpStatus.OK ? 'success' : 'fail';
    //3. update job_db => status: SUCCESS/FAIL
    /* TODO: const job_resp = await this.prisma.jobs.update({
      data: {
        status: status_resp
      }, where: {
        job_uuid: job_uuid
      }
    })*/
    return resp;
  }
}
