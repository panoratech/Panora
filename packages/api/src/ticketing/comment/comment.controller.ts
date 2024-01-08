import {
  Controller,
  Post,
  Body,
  Query,
  Get,
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
import { CommentService } from './services/comment.service';
import { UnifiedCommentInput } from './types/model.unified';

@ApiTags('ticketing/comment')
@Controller('ticketing/comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CommentController.name);
  }

  @ApiOperation({
    operationId: 'getComments',
    summary: 'List a batch of Comments',
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
  //@ApiCustomResponse(CommentResponse)
  @Get()
  getComments(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.commentService.getComments(
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'getComment',
    summary: 'Retrieve a Comment',
    description: 'Retrieve a comment from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the `comment` you want to retrive.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(CommentResponse)
  @Get(':id')
  getComment(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.commentService.getComment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addComment',
    summary: 'Create a Comment',
    description: 'Create a comment in any supported Ticketing software',
  })
  @ApiHeader({
    name: 'integrationId',
    required: true,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiHeader({
    name: 'linkedUserId',
    required: true,
    description: 'The linked user ID',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiBody({ type: UnifiedCommentInput })
  //@ApiCustomResponse(CommentResponse)
  @Post()
  addComment(
    @Body() unfiedCommentData: UnifiedCommentInput,
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.commentService.addComment(
      unfiedCommentData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'addComments',
    summary: 'Add a batch of Comments',
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
  @ApiBody({ type: UnifiedCommentInput, isArray: true })
  //@ApiCustomResponse(CommentResponse)
  @Post('batch')
  addComments(
    @Body() unfiedCommentData: UnifiedCommentInput[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.commentService.batchAddComments(
      unfiedCommentData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }
}
