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
import { DealService } from './services/deal.service';
import { UnifiedDealInput, UnifiedDealOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/deal')
@Controller('crm/deal')
export class DealController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly dealService: DealService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(DealController.name);
  }

  @ApiOperation({
    operationId: 'getDeals',
    summary: 'List a batch of Deals',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedDealOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getDeals(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.dealService.getDeals(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getDeal',
    summary: 'Retrieve a Deal',
    description: 'Retrieve a deal from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the deal you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedDealOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getDeal(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.dealService.getDeal(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addDeal',
    summary: 'Create a Deal',
    description: 'Create a deal in any supported Crm software',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedDealInput })
  @ApiCustomResponse(UnifiedDealOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addDeal(
    @Body() unifiedDealData: UnifiedDealInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.dealService.addDeal(
        unifiedDealData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addDeals',
    summary: 'Add a batch of Deals',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedDealInput, isArray: true })
  @ApiCustomResponse(UnifiedDealOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addDeals(
    @Body() unfiedDealData: UnifiedDealInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.dealService.batchAddDeals(
        unfiedDealData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'updateDeal',
    summary: 'Update a Deal',
  })
  @ApiCustomResponse(UnifiedDealOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Patch(':id')
  updateDeal(
    @Param('id') id: string,
    @Body() updateDealData: Partial<UnifiedDealInput>,
  ) {
    return this.dealService.updateDeal(id, updateDealData);
  }
}
