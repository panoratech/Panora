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
import { ScorecardService } from './services/scorecard.service';
import { UnifiedScorecardInput, UnifiedScorecardOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/scorecard')
@Controller('ats/scorecard')
export class ScorecardController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly scorecardService: ScorecardService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ScorecardController.name);
  }

  @ApiOperation({
    operationId: 'getScorecards',
    summary: 'List a batch of Scorecards',
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
  @ApiCustomResponse(UnifiedScorecardOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getScorecards(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.scorecardService.getScorecards(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getScorecard',
    summary: 'Retrieve a Scorecard',
    description: 'Retrieve a scorecard from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the scorecard you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedScorecardOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getScorecard(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.scorecardService.getScorecard(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addScorecard',
    summary: 'Create a Scorecard',
    description: 'Create a scorecard in any supported Ats software',
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
  @ApiBody({ type: UnifiedScorecardInput })
  @ApiCustomResponse(UnifiedScorecardOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addScorecard(
    @Body() unifiedScorecardData: UnifiedScorecardInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.scorecardService.addScorecard(
        unifiedScorecardData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addScorecards',
    summary: 'Add a batch of Scorecards',
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
  @ApiBody({ type: UnifiedScorecardInput, isArray: true })
  @ApiCustomResponse(UnifiedScorecardOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addScorecards(
    @Body() unfiedScorecardData: UnifiedScorecardInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.scorecardService.batchAddScorecards(
        unfiedScorecardData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateScorecard',
    summary: 'Update a Scorecard',
  })
  @ApiCustomResponse(UnifiedScorecardOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateScorecard(
    @Query('id') id: string,
    @Body() updateScorecardData: Partial<UnifiedScorecardInput>,
  ) {
    return this.scorecardService.updateScorecard(id, updateScorecardData);
  }
}
