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
import { ScreeningQuestionService } from './services/screeningquestion.service';
import { UnifiedScreeningQuestionInput, UnifiedScreeningQuestionOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/screeningquestion')
@Controller('ats/screeningquestion')
export class ScreeningQuestionController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly screeningquestionService: ScreeningQuestionService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ScreeningQuestionController.name);
  }

  @ApiOperation({
    operationId: 'getScreeningQuestions',
    summary: 'List a batch of ScreeningQuestions',
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
  @ApiCustomResponse(UnifiedScreeningQuestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getScreeningQuestions(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.getScreeningQuestions(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getScreeningQuestion',
    summary: 'Retrieve a ScreeningQuestion',
    description: 'Retrieve a screeningquestion from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the screeningquestion you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedScreeningQuestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getScreeningQuestion(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.screeningquestionService.getScreeningQuestion(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addScreeningQuestion',
    summary: 'Create a ScreeningQuestion',
    description: 'Create a screeningquestion in any supported Ats software',
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
  @ApiBody({ type: UnifiedScreeningQuestionInput })
  @ApiCustomResponse(UnifiedScreeningQuestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addScreeningQuestion(
    @Body() unifiedScreeningQuestionData: UnifiedScreeningQuestionInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.addScreeningQuestion(
        unifiedScreeningQuestionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addScreeningQuestions',
    summary: 'Add a batch of ScreeningQuestions',
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
  @ApiBody({ type: UnifiedScreeningQuestionInput, isArray: true })
  @ApiCustomResponse(UnifiedScreeningQuestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addScreeningQuestions(
    @Body() unfiedScreeningQuestionData: UnifiedScreeningQuestionInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.batchAddScreeningQuestions(
        unfiedScreeningQuestionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateScreeningQuestion',
    summary: 'Update a ScreeningQuestion',
  })
  @ApiCustomResponse(UnifiedScreeningQuestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateScreeningQuestion(
    @Query('id') id: string,
    @Body() updateScreeningQuestionData: Partial<UnifiedScreeningQuestionInput>,
  ) {
    return this.screeningquestionService.updateScreeningQuestion(id, updateScreeningQuestionData);
  }
}
