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
import { IncomeStatementService } from './services/incomestatement.service';
import {
  UnifiedIncomeStatementInput,
  UnifiedIncomeStatementOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/incomestatement')
@Controller('accounting/incomestatement')
export class IncomeStatementController {
  constructor(
    private readonly incomestatementService: IncomeStatementService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(IncomeStatementController.name);
  }

  @ApiOperation({
    operationId: 'getIncomeStatements',
    summary: 'List a batch of IncomeStatements',
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
  @ApiCustomResponse(UnifiedIncomeStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getIncomeStatements(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.incomestatementService.getIncomeStatements(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getIncomeStatement',
    summary: 'Retrieve a IncomeStatement',
    description:
      'Retrieve a incomestatement from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedIncomeStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getIncomeStatement(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.incomestatementService.getIncomeStatement(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addIncomeStatement',
    summary: 'Create a IncomeStatement',
    description:
      'Create a incomestatement in any supported Accounting software',
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
  @ApiBody({ type: UnifiedIncomeStatementInput })
  @ApiCustomResponse(UnifiedIncomeStatementOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addIncomeStatement(
    @Body() unifiedIncomeStatementData: UnifiedIncomeStatementInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.incomestatementService.addIncomeStatement(
        unifiedIncomeStatementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
