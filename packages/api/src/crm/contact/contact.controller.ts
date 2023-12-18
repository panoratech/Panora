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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ContactResponse, ApiCustomResponse } from './types';
@ApiTags('crm/contact')
@Controller('crm/contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ContactController.name);
  }

  @ApiOperation({
    operationId: 'getContacts',
    summary: 'List a batch of CRM Contacts',
  })
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiCustomResponse(ContactResponse)
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

  @ApiOperation({
    operationId: 'getContact',
    summary: 'Retrieve a CRM Contact',
    description: 'Retrive a contact in any supported CRM',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiCustomResponse(ContactResponse)
  @Get(':id')
  getContact(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.getContact(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addContact',
    summary: 'Create CRM Contact',
    description: 'Create a contact in any supported CRM',
  })
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiBody({ type: UnifiedContactInput })
  @ApiCustomResponse(ContactResponse)
  @Post()
  addContact(
    @Body() unfiedContactData: UnifiedContactInput,
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.addContact(
      unfiedContactData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'addContacts',
    summary: 'Add a batch of CRM Contacts',
  })
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'remote_data', required: false, type: Boolean })
  @ApiBody({ type: UnifiedContactInput, isArray: true })
  @ApiCustomResponse(ContactResponse)
  @Post('batch')
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

  @ApiOperation({
    operationId: 'updateContact',
    summary: 'Update a CRM Contact',
  })
  @Patch()
  updateContact(
    @Query('id') id: string,
    @Body() updateContactData: Partial<UnifiedContactInput>,
  ) {
    return this.contactService.updateContact(id, updateContactData);
  }
}
