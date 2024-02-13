import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { LoggerService } from '@@core/logger/logger.service';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from './types/model.unified';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiCustomResponse } from '@@core/utils/types';

@ApiTags('crm/contacts')
@Controller('crm/contacts')
export class ContactController {
  private readonly connectionUtils = new ConnectionUtils();

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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getContacts(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.contactService.getContacts(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
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
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiBody({ type: UnifiedContactInput })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addContact(
    @Body() unfiedContactData: UnifiedContactInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      this.logger.log('x-connection-token is ' + connection_token);
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.contactService.addContact(
        unfiedContactData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addContacts',
    summary: 'Add a batch of CRM Contacts',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original CRM software.',
  })
  @ApiBody({ type: UnifiedContactInput, isArray: true })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addContacts(
    @Body() unfiedContactData: UnifiedContactInput[],
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.contactService.batchAddContacts(
        unfiedContactData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
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
