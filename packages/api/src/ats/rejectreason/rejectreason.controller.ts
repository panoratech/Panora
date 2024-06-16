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
import { RejectreasonService } from './services/rejectreason.service';
import { UnifiedRejectreasonInput, UnifiedRejectreasonOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/rejectreason')
@Controller('ats/rejectreason')
export class RejectreasonController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly rejectreasonService: RejectreasonService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(RejectreasonController.name);
  }

  @ApiOperation({
    operationId: 'getRejectreasons',
    summary: 'List a batch of Rejectreasons',
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
  @ApiCustomResponse(UnifiedRejectreasonOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getRejectreasons(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.rejectreasonService.getRejectreasons(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getRejectreason',
    summary: 'Retrieve a Rejectreason',
    description: 'Retrieve a rejectreason from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the rejectreason you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedRejectreasonOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getRejectreason(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.rejectreasonService.getRejectreason(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addRejectreason',
    summary: 'Create a Rejectreason',
    description: 'Create a rejectreason in any supported Ats software',
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
  @ApiBody({ type: UnifiedRejectreasonInput })
  @ApiCustomResponse(UnifiedRejectreasonOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addRejectreason(
    @Body() unifiedRejectreasonData: UnifiedRejectreasonInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.rejectreasonService.addRejectreason(
        unifiedRejectreasonData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addRejectreasons',
    summary: 'Add a batch of Rejectreasons',
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
  @ApiBody({ type: UnifiedRejectreasonInput, isArray: true })
  @ApiCustomResponse(UnifiedRejectreasonOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addRejectreasons(
    @Body() unfiedRejectreasonData: UnifiedRejectreasonInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.rejectreasonService.batchAddRejectreasons(
        unfiedRejectreasonData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateRejectreason',
    summary: 'Update a Rejectreason',
  })
  @ApiCustomResponse(UnifiedRejectreasonOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateRejectreason(
    @Query('id') id: string,
    @Body() updateRejectreasonData: Partial<UnifiedRejectreasonInput>,
  ) {
    return this.rejectreasonService.updateRejectreason(id, updateRejectreasonData);
  }
}
