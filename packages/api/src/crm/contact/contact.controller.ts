import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ContactService } from './services/contact.service';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from './types/model.unified';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
  PaginatedDto,
} from '@@core/utils/dtos/openapi.respone.dto';

@ApiBearerAuth('bearer')
@ApiTags('crm/contacts')
@Controller('crm/contacts')
@ApiExtraModels(PaginatedDto, UnifiedCrmContactOutput)
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
  @ApiPaginatedResponse(UnifiedCrmContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getContacts(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return await this.contactService.getContacts(
        connectionId,
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
    operationId: 'retrieveCrmContact',
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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedCrmContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.contactService.getContact(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createCrmContact',
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
  @ApiBody({ type: UnifiedCrmContactInput })
  @ApiPostCustomResponse(UnifiedCrmContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addContact(
    @Body() unifiedContactData: UnifiedCrmContactInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      // this.logger.log('x-connection-token is ' + connection_token);
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.contactService.addContact(
        unifiedContactData,
        connectionId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
