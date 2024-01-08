import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { TagService } from './services/tag.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedTagOutput } from './types/model.unified';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/tag')
@Controller('ticketing/tag')
export class TagController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly tagService: TagService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TagController.name);
  }

  @ApiOperation({
    operationId: 'getTags',
    summary: 'List a batch of Tags',
  })
  @ApiHeader({
    name: 'connection_token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedTagOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTags(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.tagService.getTags(remoteSource, linkedUserId, remote_data);
    } catch (error) {}
  }

  @ApiOperation({
    operationId: 'getTag',
    summary: 'Retrieve a Tag',
    description: 'Retrieve a tag from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the tag you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedTagOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTag(@Param('id') id: string, @Query('remote_data') remote_data?: boolean) {
    return this.tagService.getTag(id, remote_data);
  }
}
