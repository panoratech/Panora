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
import { FileService } from './services/file.service';
import { UnifiedFileInput, UnifiedFileOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('filestorage/file')
@Controller('filestorage/file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(FileController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of Files',
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
  @ApiCustomResponse(UnifiedFileOutput)
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
      return this.fileService.getFiles(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a File',
    description: 'Retrieve a file from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the file you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedFileOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.fileService.getFile(id, remote_data);
  }

  @ApiOperation({
    operationId: 'create',
    summary: 'Create a File',
    description: 'Create a file in any supported Filestorage software',
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
  @ApiBody({ type: UnifiedFileInput })
  @ApiCustomResponse(UnifiedFileOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async create(
    @Body() unifiedFileData: UnifiedFileInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.fileService.addFile(
        unifiedFileData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
