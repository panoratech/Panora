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
import { PurchaseorderService } from './services/purchaseorder.service';
import { UnifiedPurchaseorderInput, UnifiedPurchaseorderOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/purchaseorder')
@Controller('accounting/purchaseorder')
export class PurchaseorderController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly purchaseorderService: PurchaseorderService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(PurchaseorderController.name);
  }

  @ApiOperation({
    operationId: 'getPurchaseorders',
    summary: 'List a batch of Purchaseorders',
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
  @ApiCustomResponse(UnifiedPurchaseorderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPurchaseorders(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.purchaseorderService.getPurchaseorders(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPurchaseorder',
    summary: 'Retrieve a Purchaseorder',
    description: 'Retrieve a purchaseorder from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the purchaseorder you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedPurchaseorderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPurchaseorder(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.purchaseorderService.getPurchaseorder(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPurchaseorder',
    summary: 'Create a Purchaseorder',
    description: 'Create a purchaseorder in any supported Accounting software',
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
  @ApiBody({ type: UnifiedPurchaseorderInput })
  @ApiCustomResponse(UnifiedPurchaseorderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPurchaseorder(
    @Body() unifiedPurchaseorderData: UnifiedPurchaseorderInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.purchaseorderService.addPurchaseorder(
        unifiedPurchaseorderData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addPurchaseorders',
    summary: 'Add a batch of Purchaseorders',
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
  @ApiBody({ type: UnifiedPurchaseorderInput, isArray: true })
  @ApiCustomResponse(UnifiedPurchaseorderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addPurchaseorders(
    @Body() unfiedPurchaseorderData: UnifiedPurchaseorderInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.purchaseorderService.batchAddPurchaseorders(
        unfiedPurchaseorderData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updatePurchaseorder',
    summary: 'Update a Purchaseorder',
  })
  @ApiCustomResponse(UnifiedPurchaseorderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updatePurchaseorder(
    @Query('id') id: string,
    @Body() updatePurchaseorderData: Partial<UnifiedPurchaseorderInput>,
  ) {
    return this.purchaseorderService.updatePurchaseorder(id, updatePurchaseorderData);
  }
}
