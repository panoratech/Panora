import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  UseGuards,
  Headers
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
  ApiHeader
} from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true})
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  //@ApiCustomResponse(ContactResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  getContacts(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
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
    description: 'Retrieve a contact from any connected CRM',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the `contact` you want to retrive.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  //@ApiCustomResponse(ContactResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getContact(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.contactService.getContact(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addContact',
    summary: 'Create CRM Contact',
    description: 'Create a contact in any supported CRM',
  })
  @ApiHeader({
    name: 'integrationId',
    required: true,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiHeader({
    name: 'linkedUserId',
    required: true,
    description: 'The linked user ID',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiBody({ type: UnifiedContactInput })
  //@ApiCustomResponse(ContactResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  addContact(
    @Body() unfiedContactData: UnifiedContactInput,
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiBody({ type: UnifiedContactInput, isArray: true })
  //@ApiCustomResponse(ContactResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  addContacts(
    @Body() unfiedContactData: UnifiedContactInput[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
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
  @UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateContact(
    @Query('id') id: string,
    @Body() updateContactData: Partial<UnifiedContactInput>,
  ) {
    return this.contactService.updateContact(id, updateContactData);
  }
}
