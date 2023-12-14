import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { LoggerService } from '@@core/logger/logger.service';
import { UnifiedContactInput } from './types/model.unified';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('crm/contact')
@Controller('crm/contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ContactController.name);
  }

  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiResponse({ status: 200 })
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

  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get(':id')
  getContact(@Param('id') id: string) {
    return this.contactService.getContact(id);
  }

  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiBody({ type: UnifiedContactInput, isArray: true })
  @ApiResponse({ status: 201 })
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
}
