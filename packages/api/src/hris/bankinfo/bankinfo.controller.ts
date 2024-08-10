import {
  Controller,
  Post,
  Body,
  Query,
  Get,
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

import { BankInfoService } from './services/bankinfo.service';
import {
  UnifiedHrisBankinfoInput,
  UnifiedHrisBankinfoOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
} from '@@core/utils/dtos/openapi.respone.dto';


@ApiTags('hris/bankinfos')
@Controller('hris/bankinfos')
export class BankinfoController {
  constructor(
    private readonly bankInfoService: BankInfoService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(BankinfoController.name);
  }

  @ApiOperation({
    operationId: 'listHrisBankInfo',
    summary: 'List Bank Info',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedHrisBankinfoOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getBankInfo(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.bankInfoService.getBankinfos(
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
    operationId: 'retrieveHrisBankInfo',
    summary: 'Retrieve Bank Info',
    description: 'Retrieve Bank Info from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the bank info you want to retrieve.',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
    example: false,
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedHrisBankinfoOutput)
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
    return this.bankInfoService.getBankinfo(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }
}
