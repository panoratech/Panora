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
import { EventService } from './services/event.service';
import { UnifiedEventInput, UnifiedEventOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/event')
@Controller('marketingautomation/event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(EventController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of Events',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedEventOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async list(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.eventService.getEvents(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a Event',
    description:
      'Retrieve a event from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the event you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedEventOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.eventService.getEvent(id, remote_data);
  }

  @ApiOperation({
    operationId: 'create',
    summary: 'Create a Event',
    description: 'Create a event in any supported Marketingautomation software',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedEventInput })
  @ApiCustomResponse(UnifiedEventOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async create(
    @Body() unifiedEventData: UnifiedEventInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.eventService.addEvent(
        unifiedEventData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
