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
import { TimeoffBalanceService } from './services/timeoffbalance.service';
import {
  UnifiedTimeoffBalanceInput,
  UnifiedTimeoffBalanceOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('hris/timeoffbalance')
@Controller('hris/timeoffbalance')
export class TimeoffBalanceController {
  constructor(
    private readonly timeoffbalanceService: TimeoffBalanceService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TimeoffBalanceController.name);
  }

  @ApiOperation({
    operationId: 'getTimeoffBalances',
    summary: 'List a batch of TimeoffBalances',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedTimeoffBalanceOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTimeoffBalances(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.timeoffbalanceService.getTimeoffBalances(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTimeoffBalance',
    summary: 'Retrieve a TimeoffBalance',
    description: 'Retrieve a timeoffbalance from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the timeoffbalance you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedTimeoffBalanceOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTimeoffBalance(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.timeoffbalanceService.getTimeoffBalance(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTimeoffBalance',
    summary: 'Create a TimeoffBalance',
    description: 'Create a timeoffbalance in any supported Hris software',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiBody({ type: UnifiedTimeoffBalanceInput })
  @ApiCustomResponse(UnifiedTimeoffBalanceOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTimeoffBalance(
    @Body() unifiedTimeoffBalanceData: UnifiedTimeoffBalanceInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.timeoffbalanceService.addTimeoffBalance(
        unifiedTimeoffBalanceData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
