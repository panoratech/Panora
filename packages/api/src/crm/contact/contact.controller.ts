import { Controller, Post, Body, Query, Get, Patch } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { LoggerService } from '@@core/logger/logger.service';
import { UnifiedContactInput } from './types/model.unified';

@Controller('crm/contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ContactController.name);
  }

  //todo
  @Get('properties')
  getCustomProperties(@Query('linkedUserId') linkedUserId: string) {
    return this.contactService.getCustomProperties(linkedUserId);
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
  addContacts(
    @Body() unfiedContactData: UnifiedContactInput[],
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.batchAddContacts(
      unfiedContactData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @Patch()
  updateContact(
    @Query('id') id: string,
    @Body() updateContactData: Partial<UnifiedContactInput>,
  ) {
    return this.contactService.updateContact(id, updateContactData);
  }

  // TODO: update contact
}
