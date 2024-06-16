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
import { BalancesheetService } from './services/balancesheet.service';
import { UnifiedBalancesheetInput, UnifiedBalancesheetOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/balancesheet')
@Controller('accounting/balancesheet')
export class BalancesheetController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly balancesheetService: BalancesheetService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(BalancesheetController.name);
  }

  @ApiOperation({
    operationId: 'getBalancesheets',
    summary: 'List a batch of Balancesheets',
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
  @ApiCustomResponse(UnifiedBalancesheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getBalancesheets(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.balancesheetService.getBalancesheets(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getBalancesheet',
    summary: 'Retrieve a Balancesheet',
    description: 'Retrieve a balancesheet from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the balancesheet you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedBalancesheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getBalancesheet(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.balancesheetService.getBalancesheet(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addBalancesheet',
    summary: 'Create a Balancesheet',
    description: 'Create a balancesheet in any supported Accounting software',
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
  @ApiBody({ type: UnifiedBalancesheetInput })
  @ApiCustomResponse(UnifiedBalancesheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addBalancesheet(
    @Body() unifiedBalancesheetData: UnifiedBalancesheetInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.balancesheetService.addBalancesheet(
        unifiedBalancesheetData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addBalancesheets',
    summary: 'Add a batch of Balancesheets',
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
  @ApiBody({ type: UnifiedBalancesheetInput, isArray: true })
  @ApiCustomResponse(UnifiedBalancesheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addBalancesheets(
    @Body() unfiedBalancesheetData: UnifiedBalancesheetInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.balancesheetService.batchAddBalancesheets(
        unfiedBalancesheetData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateBalancesheet',
    summary: 'Update a Balancesheet',
  })
  @ApiCustomResponse(UnifiedBalancesheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateBalancesheet(
    @Query('id') id: string,
    @Body() updateBalancesheetData: Partial<UnifiedBalancesheetInput>,
  ) {
    return this.balancesheetService.updateBalancesheet(id, updateBalancesheetData);
  }
}
