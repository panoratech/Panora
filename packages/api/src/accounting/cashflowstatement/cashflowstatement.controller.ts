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
import { CashflowStatementService } from './services/cashflowstatement.service';
import {
  UnifiedCashflowStatementInput,
  UnifiedCashflowStatementOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/cashflowstatement')
@Controller('accounting/cashflowstatement')
export class CashflowStatementController {
  constructor(
    private readonly cashflowstatementService: CashflowStatementService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CashflowStatementController.name);
  }

  @ApiOperation({
    operationId: 'getCashflowStatements',
    summary: 'List a batch of CashflowStatements',
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
  @ApiCustomResponse(UnifiedCashflowStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCashflowStatements(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.cashflowstatementService.getCashflowStatements(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCashflowStatement',
    summary: 'Retrieve a CashflowStatement',
    description:
      'Retrieve a cashflowstatement from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedCashflowStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCashflowStatement(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.cashflowstatementService.getCashflowStatement(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCashflowStatement',
    summary: 'Create a CashflowStatement',
    description:
      'Create a cashflowstatement in any supported Accounting software',
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
  @ApiBody({ type: UnifiedCashflowStatementInput })
  @ApiCustomResponse(UnifiedCashflowStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCashflowStatement(
    @Body() unifiedCashflowStatementData: UnifiedCashflowStatementInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.cashflowstatementService.addCashflowStatement(
        unifiedCashflowStatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
