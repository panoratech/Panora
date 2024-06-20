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
import { ListService } from './services/list.service';
import { UnifiedListInput, UnifiedListOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/list')
@Controller('marketingautomation/list')
export class ListController {
  constructor(
    private readonly listService: ListService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(ListController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of Lists',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedListOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async list(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.listService.getLists(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a List',
    description:
      'Retrieve a list from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the list you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedListOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.listService.getList(id, remote_data);
  }

  @ApiOperation({
    operationId: 'create',
    summary: 'Create a List',
    description: 'Create a list in any supported Marketingautomation software',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedListInput })
  @ApiCustomResponse(UnifiedListOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async create(
    @Body() unifiedListData: UnifiedListInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.listService.addList(
        unifiedListData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
