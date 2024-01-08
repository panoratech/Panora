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
import { ApiCustomResponse } from '@@core/utils/types';
import { AttachmentService } from './services/attachment.service';
import { UnifiedAttachmentInput } from './types/model.unified';

@ApiTags('ticketing/attachment')
@Controller('ticketing/attachment')
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AttachmentController.name);
  }

  @ApiOperation({
    operationId: 'getAttachments',
    summary: 'List a batch of Attachments',
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
  //@ApiCustomResponse(AttachmentResponse)
  @Get()
  getAttachments(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.attachmentService.getAttachments(
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'getAttachment',
    summary: 'Retrieve a Attachment',
    description: 'Retrieve a attachment from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the attachment you want to retrive.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(AttachmentResponse)
  @Get(':id')
  getAttachment(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.attachmentService.getAttachment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'downloadAttachment',
    summary: 'Download a Attachment',
    description: 'Download a attachment from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the attachment you want to retrive.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(AttachmentResponse)
  @Get(':id/download')
  downloadAttachment(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.attachmentService.downloadAttachment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addAttachment',
    summary: 'Create a Attachment',
    description: 'Create a attachment in any supported Ticketing software',
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
  @ApiBody({ type: UnifiedAttachmentInput })
  //@ApiCustomResponse(AttachmentResponse)
  @Post()
  addAttachment(
    @Body() unfiedAttachmentData: UnifiedAttachmentInput,
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.attachmentService.addAttachment(
      unfiedAttachmentData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'addAttachments',
    summary: 'Add a batch of Attachments',
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
  @ApiBody({ type: UnifiedAttachmentInput, isArray: true })
  //@ApiCustomResponse(AttachmentResponse)
  @Post('batch')
  addAttachments(
    @Body() unfiedAttachmentData: UnifiedAttachmentInput[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.attachmentService.batchAddAttachments(
      unfiedAttachmentData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }
}
