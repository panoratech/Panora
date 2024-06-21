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
import { BalanceSheetService } from './services/balancesheet.service';
import {
  UnifiedBalanceSheetInput,
  UnifiedBalanceSheetOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/balancesheet')
@Controller('accounting/balancesheet')
export class BalanceSheetController {
  constructor(
    private readonly balancesheetService: BalanceSheetService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(BalanceSheetController.name);
  }

  @ApiOperation({
    operationId: 'getBalanceSheets',
    summary: 'List a batch of BalanceSheets',
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
  @ApiCustomResponse(UnifiedBalanceSheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getBalanceSheets(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.balancesheetService.getBalanceSheets(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getBalanceSheet',
    summary: 'Retrieve a BalanceSheet',
    description:
      'Retrieve a balancesheet from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedBalanceSheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getBalanceSheet(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.balancesheetService.getBalanceSheet(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addBalanceSheet',
    summary: 'Create a BalanceSheet',
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
  @ApiBody({ type: UnifiedBalanceSheetInput })
  @ApiCustomResponse(UnifiedBalanceSheetOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addBalanceSheet(
    @Body() unifiedBalanceSheetData: UnifiedBalanceSheetInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.balancesheetService.addBalanceSheet(
        unifiedBalanceSheetData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
