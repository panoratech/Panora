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
import { DealResponse } from './types';
import { UnifiedDealInput } from './types/model.unified';

@ApiTags('crm/deal')
@Controller('crm/deal')
export class DealController {
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Crm software.',
  })
  //@ApiCustomResponse(DealResponse)
  @Get()
  getDeals(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.dealService.getDeals(
      integrationId,
      linkedUserId,
      remote_data,
    );
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
    description: 'id of the  you want to retrive.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Crm software.',
  })
  //@ApiCustomResponse(DealResponse)
  @Get(':id')
  getDeal(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.dealService.getDeal(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addDeal',
    summary: 'Create a Deal',
    description: 'Create a deal in any supported Crm software',
  })
  @ApiHeader({
    name: 'integrationId',
    required: true,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiHeader({
    name: 'linkedUserId',
    required: true,
    description: 'The linked user ID',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedDealInput })
  //@ApiCustomResponse(DealResponse)
  @Post()
  addDeal(
    @Body() unfiedDealData: UnifiedDealInput,
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.dealService.addDeal(
      unfiedDealData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'addDeals',
    summary: 'Add a batch of Deals',
  })
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedDealInput, isArray: true })
  //@ApiCustomResponse(DealResponse)
  @Post('batch')
  addDeals(
    @Body() unfiedDealData: UnifiedDealInput[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.dealService.batchAddDeals(
      unfiedDealData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'updateDeal',
    summary: 'Update a Deal',
  })
  @Patch()
  updateDeal(
    @Query('id') id: string,
    @Body() updateDealData: Partial<UnifiedDealInput>,
  ) {
    return this.dealService.updateDeal(id, updateDealData);
  }
}
