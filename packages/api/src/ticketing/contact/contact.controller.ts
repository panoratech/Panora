import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { ContactService } from './services/contact.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedContactOutput } from './types/model.unified';
import { ApiCustomResponse } from '@@core/utils/types';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/contact')
@Controller('ticketing/contact')
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
    name: 'connection_token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getContacts(
    @Headers('connection_token') connection_token: string,
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
    } catch (error) {}
  }

  @ApiOperation({
    operationId: 'getContact',
    summary: 'Retrieve a Contact',
    description: 'Retrieve a contact from any connected Ticketing software',
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
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  @Get(':id')
  @UseGuards(ApiKeyAuthGuard)
  getContact(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.contactService.getContact(id, remote_data);
  }
}
