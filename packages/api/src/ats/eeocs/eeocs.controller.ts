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

import {
  UnifiedAtsEeocsInput,
  UnifiedAtsEeocsOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { EeocsService } from './services/eeocs.service';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
} from '@@core/utils/dtos/openapi.respone.dto';


@ApiTags('ats/eeocs')
@Controller('ats/eeocs')
export class EeocsController {
  constructor(
    private readonly eeocsService: EeocsService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(EeocsController.name);
  }

  @ApiOperation({
    operationId: 'listAtsEeocs', // Updated operationId
    summary: 'List  Eeocss',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedAtsEeocsOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getEeocss(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.eeocsService.getEeocss(
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
    operationId: 'retrieveAtsEeocs', // Updated operationId
    summary: 'Retrieve Eeocs',
    description: 'Retrieve a eeocs from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the eeocs you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedAtsEeocsOutput)
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
    return this.eeocsService.getEeocs(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }
}
