import { Controller, Post, Body, Query } from '@nestjs/common';
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
