import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { UnifiedContactInput } from './dto/create-contact.dto';
import { LoggerService } from 'src/@core/logger/logger.service';

@Controller('crm/contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ContactController.name);
  }

  @Get()
  getContacts(
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.getContacts(
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @Post()
  addContact(
    @Body() unfiedContactData: UnifiedContactInput,
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
  ) {
    return this.contactService.addContact(
      unfiedContactData,
      integrationId,
      linkedUserId,
    );
  }
}
