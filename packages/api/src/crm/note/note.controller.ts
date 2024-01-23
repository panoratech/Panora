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
import { NoteService } from './services/note.service';
import { UnifiedNoteInput, UnifiedNoteOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/note')
@Controller('crm/note')
export class NoteController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly noteService: NoteService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(NoteController.name);
  }

  @ApiOperation({
    operationId: 'getNotes',
    summary: 'List a batch of Notes',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedNoteOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getNotes(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.noteService.getNotes(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getNote',
    summary: 'Retrieve a Note',
    description: 'Retrieve a note from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the note you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedNoteOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getNote(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.noteService.getNote(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addNote',
    summary: 'Create a Note',
    description: 'Create a note in any supported Crm software',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedNoteInput })
  @ApiCustomResponse(UnifiedNoteOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addNote(
    @Body() unifiedNoteData: UnifiedNoteInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.noteService.addNote(
        unifiedNoteData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addNotes',
    summary: 'Add a batch of Notes',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedNoteInput, isArray: true })
  @ApiCustomResponse(UnifiedNoteOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addNotes(
    @Body() unfiedNoteData: UnifiedNoteInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.noteService.batchAddNotes(
        unfiedNoteData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
