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
import { LocationService } from './services/location.service';
import {
  UnifiedLocationInput,
  UnifiedLocationOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('hris/location')
@Controller('hris/location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(LocationController.name);
  }

  @ApiOperation({
    operationId: 'getLocations',
    summary: 'List a batch of Locations',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedLocationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getLocations(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.locationService.getLocations(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getLocation',
    summary: 'Retrieve a Location',
    description: 'Retrieve a location from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the location you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedLocationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getLocation(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.locationService.getLocation(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addLocation',
    summary: 'Create a Location',
    description: 'Create a location in any supported Hris software',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiBody({ type: UnifiedLocationInput })
  @ApiCustomResponse(UnifiedLocationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addLocation(
    @Body() unifiedLocationData: UnifiedLocationInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.locationService.addLocation(
        unifiedLocationData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
