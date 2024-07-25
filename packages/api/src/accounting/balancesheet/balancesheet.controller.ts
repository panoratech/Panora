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
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BalanceSheetService } from './services/balancesheet.service';
import {
  UnifiedAccountingBalancesheetInput,
  UnifiedAccountingBalancesheetOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import { ApiGetCustomResponse, ApiPaginatedResponse } from '@@core/utils/dtos/openapi.respone.dto';

@ApiBearerAuth('bearer')
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
    operationId: 'listAccountingBalanceSheets',
    summary: 'List a batch of BalanceSheets',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedAccountingBalancesheetOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getBalanceSheets(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.balancesheetService.getBalanceSheets(
        connectionId,
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
    operationId: 'retrieveAccountingBalanceSheet',
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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedAccountingBalancesheetOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.balancesheetService.getBalanceSheet(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }
}
