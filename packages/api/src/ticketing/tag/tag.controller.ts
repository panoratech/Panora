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
import { TagService } from './services/tag.service';
import { TagResponse } from './types';
import { UnifiedTagInput } from './types/model.unified';

@ApiTags('ticketing/tag')
@Controller('ticketing/tag')
export class TagController {
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TagResponse)
  @Get()
  getTags(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.tagService.getTags(integrationId, linkedUserId, remote_data);
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
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TagResponse)
  @Get(':id')
  getTag(@Param('id') id: string, @Query('remoteData') remote_data?: boolean) {
    return this.tagService.getTag(id, remote_data);
  }
}
