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
import { IncomestatementService } from './services/incomestatement.service';
import { UnifiedIncomestatementInput, UnifiedIncomestatementOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/incomestatement')
@Controller('accounting/incomestatement')
export class IncomestatementController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly incomestatementService: IncomestatementService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(IncomestatementController.name);
  }

  @ApiOperation({
    operationId: 'getIncomestatements',
    summary: 'List a batch of Incomestatements',
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
  @ApiCustomResponse(UnifiedIncomestatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getIncomestatements(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.incomestatementService.getIncomestatements(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getIncomestatement',
    summary: 'Retrieve a Incomestatement',
    description: 'Retrieve a incomestatement from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the incomestatement you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedIncomestatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getIncomestatement(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.incomestatementService.getIncomestatement(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addIncomestatement',
    summary: 'Create a Incomestatement',
    description: 'Create a incomestatement in any supported Accounting software',
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
  @ApiBody({ type: UnifiedIncomestatementInput })
  @ApiCustomResponse(UnifiedIncomestatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addIncomestatement(
    @Body() unifiedIncomestatementData: UnifiedIncomestatementInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.incomestatementService.addIncomestatement(
        unifiedIncomestatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addIncomestatements',
    summary: 'Add a batch of Incomestatements',
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
  @ApiBody({ type: UnifiedIncomestatementInput, isArray: true })
  @ApiCustomResponse(UnifiedIncomestatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addIncomestatements(
    @Body() unfiedIncomestatementData: UnifiedIncomestatementInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.incomestatementService.batchAddIncomestatements(
        unfiedIncomestatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateIncomestatement',
    summary: 'Update a Incomestatement',
  })
  @ApiCustomResponse(UnifiedIncomestatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateIncomestatement(
    @Query('id') id: string,
    @Body() updateIncomestatementData: Partial<UnifiedIncomestatementInput>,
  ) {
    return this.incomestatementService.updateIncomestatement(id, updateIncomestatementData);
  }
}
