import { Controller, Post, Body, Query } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { UnifiedContactInput } from './dto/create-contact.dto';

@Controller('crm/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  addContact(
    @Body() unfiedContactData: UnifiedContactInput,
    @Query() integrationId: string,
    @Query() linkedUserId: string,
  ) {
    return this.contactService.addContact(
      unfiedContactData,
      integrationId,
      linkedUserId,
    );
  }
}
