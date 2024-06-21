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
import { TransactionService } from './services/transaction.service';
import {
  UnifiedTransactionInput,
  UnifiedTransactionOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/transaction')
@Controller('accounting/transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TransactionController.name);
  }

  @ApiOperation({
    operationId: 'getTransactions',
    summary: 'List a batch of Transactions',
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
  @ApiCustomResponse(UnifiedTransactionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTransactions(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.transactionService.getTransactions(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTransaction',
    summary: 'Retrieve a Transaction',
    description:
      'Retrieve a transaction from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the transaction you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedTransactionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTransaction(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.transactionService.getTransaction(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTransaction',
    summary: 'Create a Transaction',
    description: 'Create a transaction in any supported Accounting software',
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
  @ApiBody({ type: UnifiedTransactionInput })
  @ApiCustomResponse(UnifiedTransactionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTransaction(
    @Body() unifiedTransactionData: UnifiedTransactionInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.transactionService.addTransaction(
        unifiedTransactionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
