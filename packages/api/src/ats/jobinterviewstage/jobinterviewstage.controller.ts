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
import { JobinterviewstageService } from './services/jobinterviewstage.service';
import { UnifiedJobinterviewstageInput, UnifiedJobinterviewstageOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/jobinterviewstage')
@Controller('ats/jobinterviewstage')
export class JobinterviewstageController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly jobinterviewstageService: JobinterviewstageService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(JobinterviewstageController.name);
  }

  @ApiOperation({
    operationId: 'getJobinterviewstages',
    summary: 'List a batch of Jobinterviewstages',
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
  @ApiCustomResponse(UnifiedJobinterviewstageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getJobinterviewstages(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.jobinterviewstageService.getJobinterviewstages(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getJobinterviewstage',
    summary: 'Retrieve a Jobinterviewstage',
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
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedJobinterviewstageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getJobinterviewstage(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.jobinterviewstageService.getJobinterviewstage(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addJobinterviewstage',
    summary: 'Create a Jobinterviewstage',
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
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiBody({ type: UnifiedJobinterviewstageInput })
  @ApiCustomResponse(UnifiedJobinterviewstageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addJobinterviewstage(
    @Body() unifiedJobinterviewstageData: UnifiedJobinterviewstageInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.jobinterviewstageService.addJobinterviewstage(
        unifiedJobinterviewstageData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addJobinterviewstages',
    summary: 'Add a batch of Jobinterviewstages',
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
  @ApiBody({ type: UnifiedJobinterviewstageInput, isArray: true })
  @ApiCustomResponse(UnifiedJobinterviewstageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addJobinterviewstages(
    @Body() unfiedJobinterviewstageData: UnifiedJobinterviewstageInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.jobinterviewstageService.batchAddJobinterviewstages(
        unfiedJobinterviewstageData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateJobinterviewstage',
    summary: 'Update a Jobinterviewstage',
  })
  @ApiCustomResponse(UnifiedJobinterviewstageOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateJobinterviewstage(
    @Query('id') id: string,
    @Body() updateJobinterviewstageData: Partial<UnifiedJobinterviewstageInput>,
  ) {
    return this.jobinterviewstageService.updateJobinterviewstage(id, updateJobinterviewstageData);
  }
}
