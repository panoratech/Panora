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
import { JobInterviewStageService } from './services/jobinterviewstage.service';
import {
  UnifiedJobInterviewStageInput,
  UnifiedJobInterviewStageOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/jobinterviewstage')
@Controller('ats/jobinterviewstage')
export class JobInterviewStageController {
  constructor(
    private readonly jobinterviewstageService: JobInterviewStageService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(JobInterviewStageController.name);
  }

  @ApiOperation({
    operationId: 'getJobInterviewStages',
    summary: 'List a batch of JobInterviewStages',
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
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedJobInterviewStageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getJobInterviewStages(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.jobinterviewstageService.getJobInterviewStages(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getJobInterviewStage',
    summary: 'Retrieve a JobInterviewStage',
    description: 'Retrieve a jobinterviewstage from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the jobinterviewstage you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedJobInterviewStageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getJobInterviewStage(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.jobinterviewstageService.getJobInterviewStage(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addJobInterviewStage',
    summary: 'Create a JobInterviewStage',
    description: 'Create a jobinterviewstage in any supported Ats software',
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
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedJobInterviewStageInput })
  @ApiCustomResponse(UnifiedJobInterviewStageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addJobInterviewStage(
    @Body() unifiedJobInterviewStageData: UnifiedJobInterviewStageInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.jobinterviewstageService.addJobInterviewStage(
        unifiedJobInterviewStageData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
