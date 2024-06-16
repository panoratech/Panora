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
import { VendorcreditService } from './services/vendorcredit.service';
import { UnifiedVendorcreditInput, UnifiedVendorcreditOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/vendorcredit')
@Controller('accounting/vendorcredit')
export class VendorcreditController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly vendorcreditService: VendorcreditService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(VendorcreditController.name);
  }

  @ApiOperation({
    operationId: 'getVendorcredits',
    summary: 'List a batch of Vendorcredits',
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
  @ApiCustomResponse(UnifiedVendorcreditOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getVendorcredits(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.vendorcreditService.getVendorcredits(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getVendorcredit',
    summary: 'Retrieve a Vendorcredit',
    description: 'Retrieve a vendorcredit from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the vendorcredit you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedVendorcreditOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getVendorcredit(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.vendorcreditService.getVendorcredit(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addVendorcredit',
    summary: 'Create a Vendorcredit',
    description: 'Create a vendorcredit in any supported Accounting software',
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
  @ApiBody({ type: UnifiedVendorcreditInput })
  @ApiCustomResponse(UnifiedVendorcreditOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addVendorcredit(
    @Body() unifiedVendorcreditData: UnifiedVendorcreditInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.vendorcreditService.addVendorcredit(
        unifiedVendorcreditData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addVendorcredits',
    summary: 'Add a batch of Vendorcredits',
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
  @ApiBody({ type: UnifiedVendorcreditInput, isArray: true })
  @ApiCustomResponse(UnifiedVendorcreditOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addVendorcredits(
    @Body() unfiedVendorcreditData: UnifiedVendorcreditInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.vendorcreditService.batchAddVendorcredits(
        unfiedVendorcreditData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateVendorcredit',
    summary: 'Update a Vendorcredit',
  })
  @ApiCustomResponse(UnifiedVendorcreditOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateVendorcredit(
    @Query('id') id: string,
    @Body() updateVendorcreditData: Partial<UnifiedVendorcreditInput>,
  ) {
    return this.vendorcreditService.updateVendorcredit(id, updateVendorcreditData);
  }
}
