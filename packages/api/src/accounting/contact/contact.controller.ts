import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { ContactService } from './services/contact.service';
import { UnifiedContactInput, UnifiedContactOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/contact')
@Controller('accounting/contact')
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
    summary: 'List a batch of Contacts',
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
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getContacts(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.contactService.getContacts(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getContact',
    summary: 'Retrieve a Contact',
    description: 'Retrieve a contact from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the contact you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getContact(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.getContact(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addContact',
    summary: 'Create a Contact',
    description: 'Create a contact in any supported Accounting software',
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
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedContactInput })
  @ApiCustomResponse(UnifiedContactOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addContact(
    @Body() unifiedContactData: UnifiedContactInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.contactService.addContact(
        unifiedContactData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addContacts',
    summary: 'Add a batch of Contacts',
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
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedContactInput, isArray: true })
  @ApiCustomResponse(UnifiedContactOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addContacts(
    @Body() unfiedContactData: UnifiedContactInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
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
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateContact',
    summary: 'Update a Contact',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateContact(
    @Query('id') id: string,
    @Body() updateContactData: Partial<UnifiedContactInput>,
  ) {
    return this.contactService.updateContact(id, updateContactData);
  }
}
