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
import { ScreeningquestionService } from './services/screeningquestion.service';
import { UnifiedScreeningquestionInput, UnifiedScreeningquestionOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('ats/screeningquestion')
@Controller('ats/screeningquestion')
export class ScreeningquestionController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly screeningquestionService: ScreeningquestionService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ScreeningquestionController.name);
  }

  @ApiOperation({
    operationId: 'getScreeningquestions',
    summary: 'List a batch of Screeningquestions',
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
  @ApiCustomResponse(UnifiedScreeningquestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getScreeningquestions(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.getScreeningquestions(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getScreeningquestion',
    summary: 'Retrieve a Screeningquestion',
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
  @ApiCustomResponse(UnifiedScreeningquestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getScreeningquestion(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.screeningquestionService.getScreeningquestion(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addScreeningquestion',
    summary: 'Create a Screeningquestion',
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
  @ApiBody({ type: UnifiedScreeningquestionInput })
  @ApiCustomResponse(UnifiedScreeningquestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addScreeningquestion(
    @Body() unifiedScreeningquestionData: UnifiedScreeningquestionInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.addScreeningquestion(
        unifiedScreeningquestionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addScreeningquestions',
    summary: 'Add a batch of Screeningquestions',
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
  @ApiBody({ type: UnifiedScreeningquestionInput, isArray: true })
  @ApiCustomResponse(UnifiedScreeningquestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addScreeningquestions(
    @Body() unfiedScreeningquestionData: UnifiedScreeningquestionInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.screeningquestionService.batchAddScreeningquestions(
        unfiedScreeningquestionData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateScreeningquestion',
    summary: 'Update a Screeningquestion',
  })
  @ApiCustomResponse(UnifiedScreeningquestionOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateScreeningquestion(
    @Query('id') id: string,
    @Body() updateScreeningquestionData: Partial<UnifiedScreeningquestionInput>,
  ) {
    return this.screeningquestionService.updateScreeningquestion(id, updateScreeningquestionData);
  }
}
