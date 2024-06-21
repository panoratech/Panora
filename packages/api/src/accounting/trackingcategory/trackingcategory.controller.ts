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
import { TrackingCategoryService } from './services/trackingcategory.service';
import {
  UnifiedTrackingCategoryInput,
  UnifiedTrackingCategoryOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/trackingcategory')
@Controller('accounting/trackingcategory')
export class TrackingCategoryController {
  constructor(
    private readonly trackingcategoryService: TrackingCategoryService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TrackingCategoryController.name);
  }

  @ApiOperation({
    operationId: 'getTrackingCategorys',
    summary: 'List a batch of TrackingCategorys',
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
  @ApiCustomResponse(UnifiedTrackingCategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTrackingCategorys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.trackingcategoryService.getTrackingCategorys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTrackingCategory',
    summary: 'Retrieve a TrackingCategory',
    description:
      'Retrieve a trackingcategory from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the trackingcategory you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedTrackingCategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTrackingCategory(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.trackingcategoryService.getTrackingCategory(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTrackingCategory',
    summary: 'Create a TrackingCategory',
    description:
      'Create a trackingcategory in any supported Accounting software',
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
  @ApiBody({ type: UnifiedTrackingCategoryInput })
  @ApiCustomResponse(UnifiedTrackingCategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTrackingCategory(
    @Body() unifiedTrackingCategoryData: UnifiedTrackingCategoryInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.trackingcategoryService.addTrackingCategory(
        unifiedTrackingCategoryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
