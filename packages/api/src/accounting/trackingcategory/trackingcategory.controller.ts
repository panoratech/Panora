import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TrackingCategoryService } from './services/trackingcategory.service';
import {
  UnifiedAccountingTrackingcategoryInput,
  UnifiedAccountingTrackingcategoryOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import { ApiGetCustomResponse, ApiPaginatedResponse } from '@@core/utils/dtos/openapi.respone.dto';

@ApiBearerAuth('bearer')
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
    operationId: 'listAccountingTrackingCategorys',
    summary: 'List a batch of TrackingCategorys',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedAccountingTrackingcategoryOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTrackingCategorys(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.trackingcategoryService.getTrackingCategorys(
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
    operationId: 'retrieveAccountingTrackingCategory',
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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedAccountingTrackingcategoryOutput)
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
    return this.trackingcategoryService.getTrackingCategory(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }
}
