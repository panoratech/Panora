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
import { PurchaseOrderService } from './services/purchaseorder.service';
import {
  UnifiedPurchaseOrderInput,
  UnifiedPurchaseOrderOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/purchaseorder')
@Controller('accounting/purchaseorder')
export class PurchaseOrderController {
  constructor(
    private readonly purchaseorderService: PurchaseOrderService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(PurchaseOrderController.name);
  }

  @ApiOperation({
    operationId: 'getPurchaseOrders',
    summary: 'List a batch of PurchaseOrders',
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
  @ApiCustomResponse(UnifiedPurchaseOrderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPurchaseOrders(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.purchaseorderService.getPurchaseOrders(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPurchaseOrder',
    summary: 'Retrieve a PurchaseOrder',
    description:
      'Retrieve a purchaseorder from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedPurchaseOrderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPurchaseOrder(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.purchaseorderService.getPurchaseOrder(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPurchaseOrder',
    summary: 'Create a PurchaseOrder',
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
  @ApiBody({ type: UnifiedPurchaseOrderInput })
  @ApiCustomResponse(UnifiedPurchaseOrderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPurchaseOrder(
    @Body() unifiedPurchaseOrderData: UnifiedPurchaseOrderInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.purchaseorderService.addPurchaseOrder(
        unifiedPurchaseOrderData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
