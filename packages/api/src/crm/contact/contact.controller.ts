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
  UsePipes,
  ValidationPipe,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiCustomResponse } from '@@core/utils/types';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiBearerAuth('JWT')
@ApiTags('crm/contacts')
@Controller('crm/contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(ContactController.name);
  }

  @ApiOperation({
    operationId: 'listCrmContacts',
    summary: 'List CRM Contacts',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getContacts(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.contactService.getContacts(
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCrmContact',
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
    operationId: 'addCrmContact',
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
      // this.logger.log('x-connection-token is ' + connection_token);
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
}
