import { Controller, Query, Get, Param, Headers } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { StageService } from './services/stage.service';
import { UnifiedStageOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/stage')
@Controller('crm/stage')
export class StageController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly stageService: StageService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(StageController.name);
  }

  @ApiOperation({
    operationId: 'getStages',
    summary: 'List a batch of Stages',
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
  @ApiCustomResponse(UnifiedStageOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getStages(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.stageService.getStages(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getStage',
    summary: 'Retrieve a Stage',
    description: 'Retrieve a stage from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the stage you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedStageOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getStage(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.stageService.getStage(id, remote_data);
  }
}
