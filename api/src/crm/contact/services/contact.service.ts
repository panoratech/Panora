import { Injectable } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';

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

  async addContact(createContactDto: CreateContactDto, integrationId: string) {
    //TODO: add createContact info body to DB => addToDbBackup()
    //TODO: get the destination provider => call destinationCRMInDb()
    const dest = {};
    let resp;
    switch (dest) {
      case 'freshsales':
        resp = await this.freshsales.addContact();
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
    return resp;
  }
}
