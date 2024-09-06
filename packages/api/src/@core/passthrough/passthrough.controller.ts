import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PassThroughRequestDto } from './dto/passthrough.dto';
import { PassthroughService } from './passthrough.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { AxiosResponse } from 'axios';
import { RetryHandler } from '@@core/@core-services/request-retry/retry.handler';
import { PassthroughResponse } from './types';

@ApiTags('passthrough')
@Controller('passthrough')
export class PassthroughController {
  constructor(
    private passthroughService: PassthroughService,
    private loggerSeervice: LoggerService,
    private connectionUtils: ConnectionUtils,
    private retryService: RetryHandler,
  ) {
    this.loggerSeervice.setContext(PassthroughController.name);
  }

  @ApiOperation({
    operationId: 'request',
    summary: 'Make a passthrough request',
  })
  @ApiBody({ type: PassThroughRequestDto })
  @ApiResponse({ status: 200, type: Object })
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async passthroughRequest(
    @Body() requestParams: PassThroughRequestDto,
    @Headers('x-connection-token') connection_token: string,
  ): Promise<PassthroughResponse> {
    const {
      linkedUserId,
      remoteSource: integrationId,
      connectionId,
      vertical,
      projectId,
    } = await this.connectionUtils.getConnectionMetadataFromConnectionToken(
      connection_token,
    );
    return await this.passthroughService.sendPassthroughRequest(
      requestParams,
      integrationId,
      linkedUserId,
      vertical,
      connectionId,
      projectId,
    );
  }

  @ApiOperation({
    operationId: 'getRetriedRequestResponse',
    summary:
      'Retrieve response of a failed passthrough request due to rate limits',
  })
  @ApiParam({
    name: 'retryId',
    required: true,
    type: String,
    description:
      'id of the retryJob returned when you initiated a passthrough request.',
  })
  //@ApiResponse({ status: 200, type: AxiosResponse })
  @UseGuards(ApiKeyAuthGuard)
  @Get(':retryId')
  async getRetriedRequestResponse(
    @Param('retryId') retryId: string,
  ): Promise<AxiosResponse | null> {
    return await this.retryService.getRetryStatus(retryId);
  }
}
