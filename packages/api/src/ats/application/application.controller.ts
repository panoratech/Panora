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
import { ApplicationService } from './services/application.service';
import { UnifiedApplicationInput, UnifiedApplicationOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/application')
@Controller('ats/application')
export class ApplicationController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly applicationService: ApplicationService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ApplicationController.name);
  }

  @ApiOperation({
    operationId: 'getApplications',
    summary: 'List a batch of Applications',
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
  @ApiCustomResponse(UnifiedApplicationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getApplications(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.applicationService.getApplications(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getApplication',
    summary: 'Retrieve a Application',
    description: 'Retrieve a application from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the application you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedApplicationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getApplication(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.applicationService.getApplication(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addApplication',
    summary: 'Create a Application',
    description: 'Create a application in any supported Ats software',
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
  @ApiBody({ type: UnifiedApplicationInput })
  @ApiCustomResponse(UnifiedApplicationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addApplication(
    @Body() unifiedApplicationData: UnifiedApplicationInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.applicationService.addApplication(
        unifiedApplicationData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addApplications',
    summary: 'Add a batch of Applications',
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
  @ApiBody({ type: UnifiedApplicationInput, isArray: true })
  @ApiCustomResponse(UnifiedApplicationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addApplications(
    @Body() unfiedApplicationData: UnifiedApplicationInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.applicationService.batchAddApplications(
        unfiedApplicationData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateApplication',
    summary: 'Update a Application',
  })
  @ApiCustomResponse(UnifiedApplicationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateApplication(
    @Query('id') id: string,
    @Body() updateApplicationData: Partial<UnifiedApplicationInput>,
  ) {
    return this.applicationService.updateApplication(id, updateApplicationData);
  }
}
