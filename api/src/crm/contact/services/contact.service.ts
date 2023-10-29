import { Injectable } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreshSalesService } from './freshsales';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    public freshSales: FreshSalesService,
  ) {}

  async addContact(createContactDto: CreateContactDto, integrationId: string) {
    //TODO: call addToDbBackup()
    //TODO: get the destination provider => call destinationCRMInDb()
    const dest = {};
    let resp;
    switch (dest) {
      case 'freshsales':
        resp = await this.freshSales.addContact();
        break;
      default:
        break;
    }
    //TODO: sanitize the resp to normalize it
    return resp;
  }
}
