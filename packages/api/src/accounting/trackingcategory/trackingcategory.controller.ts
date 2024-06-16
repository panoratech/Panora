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
import { TrackingcategoryService } from './services/trackingcategory.service';
import { UnifiedTrackingcategoryInput, UnifiedTrackingcategoryOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/trackingcategory')
@Controller('accounting/trackingcategory')
export class TrackingcategoryController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly trackingcategoryService: TrackingcategoryService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TrackingcategoryController.name);
  }

  @ApiOperation({
    operationId: 'getTrackingcategorys',
    summary: 'List a batch of Trackingcategorys',
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
  @ApiCustomResponse(UnifiedTrackingcategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTrackingcategorys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.trackingcategoryService.getTrackingcategorys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTrackingcategory',
    summary: 'Retrieve a Trackingcategory',
    description: 'Retrieve a trackingcategory from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedTrackingcategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTrackingcategory(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.trackingcategoryService.getTrackingcategory(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTrackingcategory',
    summary: 'Create a Trackingcategory',
    description: 'Create a trackingcategory in any supported Accounting software',
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
  @ApiBody({ type: UnifiedTrackingcategoryInput })
  @ApiCustomResponse(UnifiedTrackingcategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTrackingcategory(
    @Body() unifiedTrackingcategoryData: UnifiedTrackingcategoryInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.trackingcategoryService.addTrackingcategory(
        unifiedTrackingcategoryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addTrackingcategorys',
    summary: 'Add a batch of Trackingcategorys',
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
  @ApiBody({ type: UnifiedTrackingcategoryInput, isArray: true })
  @ApiCustomResponse(UnifiedTrackingcategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addTrackingcategorys(
    @Body() unfiedTrackingcategoryData: UnifiedTrackingcategoryInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.trackingcategoryService.batchAddTrackingcategorys(
        unfiedTrackingcategoryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateTrackingcategory',
    summary: 'Update a Trackingcategory',
  })
  @ApiCustomResponse(UnifiedTrackingcategoryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateTrackingcategory(
    @Query('id') id: string,
    @Body() updateTrackingcategoryData: Partial<UnifiedTrackingcategoryInput>,
  ) {
    return this.trackingcategoryService.updateTrackingcategory(id, updateTrackingcategoryData);
  }
}
