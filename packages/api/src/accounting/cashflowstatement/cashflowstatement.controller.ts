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
import { CashflowstatementService } from './services/cashflowstatement.service';
import { UnifiedCashflowstatementInput, UnifiedCashflowstatementOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/cashflowstatement')
@Controller('accounting/cashflowstatement')
export class CashflowstatementController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly cashflowstatementService: CashflowstatementService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CashflowstatementController.name);
  }

  @ApiOperation({
    operationId: 'getCashflowstatements',
    summary: 'List a batch of Cashflowstatements',
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
  @ApiCustomResponse(UnifiedCashflowstatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCashflowstatements(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.cashflowstatementService.getCashflowstatements(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCashflowstatement',
    summary: 'Retrieve a Cashflowstatement',
    description: 'Retrieve a cashflowstatement from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the cashflowstatement you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedCashflowstatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCashflowstatement(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.cashflowstatementService.getCashflowstatement(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCashflowstatement',
    summary: 'Create a Cashflowstatement',
    description: 'Create a cashflowstatement in any supported Accounting software',
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
  @ApiBody({ type: UnifiedCashflowstatementInput })
  @ApiCustomResponse(UnifiedCashflowstatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCashflowstatement(
    @Body() unifiedCashflowstatementData: UnifiedCashflowstatementInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.cashflowstatementService.addCashflowstatement(
        unifiedCashflowstatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addCashflowstatements',
    summary: 'Add a batch of Cashflowstatements',
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
  @ApiBody({ type: UnifiedCashflowstatementInput, isArray: true })
  @ApiCustomResponse(UnifiedCashflowstatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addCashflowstatements(
    @Body() unfiedCashflowstatementData: UnifiedCashflowstatementInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.cashflowstatementService.batchAddCashflowstatements(
        unfiedCashflowstatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateCashflowstatement',
    summary: 'Update a Cashflowstatement',
  })
  @ApiCustomResponse(UnifiedCashflowstatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateCashflowstatement(
    @Query('id') id: string,
    @Body() updateCashflowstatementData: Partial<UnifiedCashflowstatementInput>,
  ) {
    return this.cashflowstatementService.updateCashflowstatement(id, updateCashflowstatementData);
  }
}
