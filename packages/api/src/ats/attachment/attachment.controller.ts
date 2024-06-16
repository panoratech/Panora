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
import { AttachmentService } from './services/attachment.service';
import { UnifiedAttachmentInput, UnifiedAttachmentOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/attachment')
@Controller('ats/attachment')
export class AttachmentController {
  private readonly connectionUtils = new ConnectionUtils();

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
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedAttachmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getAttachments(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.attachmentService.getAttachments(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getAttachment',
    summary: 'Retrieve a Attachment',
    description: 'Retrieve a attachment from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the attachment you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedAttachmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getAttachment(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.attachmentService.getAttachment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addAttachment',
    summary: 'Create a Attachment',
    description: 'Create a attachment in any supported Ats software',
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
      'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedAttachmentInput })
  @ApiCustomResponse(UnifiedAttachmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addAttachment(
    @Body() unifiedAttachmentData: UnifiedAttachmentInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.attachmentService.addAttachment(
        unifiedAttachmentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addAttachments',
    summary: 'Add a batch of Attachments',
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
      'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedAttachmentInput, isArray: true })
  @ApiCustomResponse(UnifiedAttachmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addAttachments(
    @Body() unfiedAttachmentData: UnifiedAttachmentInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.attachmentService.batchAddAttachments(
        unfiedAttachmentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateAttachment',
    summary: 'Update a Attachment',
  })
  @ApiCustomResponse(UnifiedAttachmentOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateAttachment(
    @Query('id') id: string,
    @Body() updateAttachmentData: Partial<UnifiedAttachmentInput>,
  ) {
    return this.attachmentService.updateAttachment(id, updateAttachmentData);
  }
}
