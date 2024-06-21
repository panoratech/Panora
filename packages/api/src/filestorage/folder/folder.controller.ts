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
import { FolderService } from './services/folder.service';
import { UnifiedFolderInput, UnifiedFolderOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('filestorage/folder')
@Controller('filestorage/folder')
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(FolderController.name);
  }

  @ApiOperation({
    operationId: 'getFolders',
    summary: 'List a batch of Folders',
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
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedFolderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getFolders(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.folderService.getFolders(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getFolder',
    summary: 'Retrieve a Folder',
    description: 'Retrieve a folder from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the folder you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedFolderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getFolder(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.folderService.getFolder(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addFolder',
    summary: 'Create a Folder',
    description: 'Create a folder in any supported Filestorage software',
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
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiBody({ type: UnifiedFolderInput })
  @ApiCustomResponse(UnifiedFolderOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addFolder(
    @Body() unifiedFolderData: UnifiedFolderInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.folderService.addFolder(
        unifiedFolderData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
