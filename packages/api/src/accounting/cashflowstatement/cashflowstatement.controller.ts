import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  //ApiKeyAuth,
} from '@nestjs/swagger';

import { CashflowStatementService } from './services/cashflowstatement.service';
import {
  UnifiedAccountingCashflowstatementInput,
  UnifiedAccountingCashflowstatementOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import { ApiGetCustomResponse, ApiPaginatedResponse } from '@@core/utils/dtos/openapi.respone.dto';


@ApiTags('accounting/cashflowstatements')
@Controller('accounting/cashflowstatements')
export class CashflowStatementController {
  constructor(
    private readonly cashflowstatementService: CashflowStatementService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CashflowStatementController.name);
  }

  @ApiOperation({
    operationId: 'listAccountingCashflowStatement',
    summary: 'List  CashflowStatements',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedAccountingCashflowstatementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCashflowStatements(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.cashflowstatementService.getCashflowStatements(
        connectionId,
        projectId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveAccountingCashflowStatement',
    summary: 'Retrieve Cashflow Statements',
    description:
      'Retrieve Cashflow Statements from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    required: true,
    type: String,
    description: 'id of the cashflowstatement you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    example: false,
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedAccountingCashflowstatementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.cashflowstatementService.getCashflowStatement(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }
}
