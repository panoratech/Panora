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
import { DriveService } from './services/drive.service';
import { UnifiedDriveInput, UnifiedDriveOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('filestorage/drive')
@Controller('filestorage/drive')
export class DriveController {
  constructor(
    private readonly driveService: DriveService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(DriveController.name);
  }

  @ApiOperation({
    operationId: 'getDrives',
    summary: 'List a batch of Drives',
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
  @ApiCustomResponse(UnifiedDriveOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getDrives(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.driveService.getDrives(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getDrive',
    summary: 'Retrieve a Drive',
    description: 'Retrieve a drive from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the drive you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedDriveOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getDrive(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.driveService.getDrive(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addDrive',
    summary: 'Create a Drive',
    description: 'Create a drive in any supported Filestorage software',
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
  @ApiBody({ type: UnifiedDriveInput })
  @ApiCustomResponse(UnifiedDriveOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addDrive(
    @Body() unifiedDriveData: UnifiedDriveInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.driveService.addDrive(
        unifiedDriveData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
