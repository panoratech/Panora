import { Controller, Post, Body, Query } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('crm/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('add-contact')
  addContact(
    @Body() createContactDto: CreateContactDto,
    @Query() integrationId: string,
  ) {
    return this.contactService.addContact(createContactDto, integrationId);
  }
}
