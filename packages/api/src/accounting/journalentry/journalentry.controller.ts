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
import { JournalentryService } from './services/journalentry.service';
import { UnifiedJournalentryInput, UnifiedJournalentryOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/journalentry')
@Controller('accounting/journalentry')
export class JournalentryController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly journalentryService: JournalentryService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(JournalentryController.name);
  }

  @ApiOperation({
    operationId: 'getJournalentrys',
    summary: 'List a batch of Journalentrys',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedJournalentryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getJournalentrys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.journalentryService.getJournalentrys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getJournalentry',
    summary: 'Retrieve a Journalentry',
    description: 'Retrieve a journalentry from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the journalentry you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedJournalentryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getJournalentry(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.journalentryService.getJournalentry(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addJournalentry',
    summary: 'Create a Journalentry',
    description: 'Create a journalentry in any supported Accounting software',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedJournalentryInput })
  @ApiCustomResponse(UnifiedJournalentryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addJournalentry(
    @Body() unifiedJournalentryData: UnifiedJournalentryInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.journalentryService.addJournalentry(
        unifiedJournalentryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addJournalentrys',
    summary: 'Add a batch of Journalentrys',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedJournalentryInput, isArray: true })
  @ApiCustomResponse(UnifiedJournalentryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addJournalentrys(
    @Body() unfiedJournalentryData: UnifiedJournalentryInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.journalentryService.batchAddJournalentrys(
        unfiedJournalentryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateJournalentry',
    summary: 'Update a Journalentry',
  })
  @ApiCustomResponse(UnifiedJournalentryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateJournalentry(
    @Query('id') id: string,
    @Body() updateJournalentryData: Partial<UnifiedJournalentryInput>,
  ) {
    return this.journalentryService.updateJournalentry(id, updateJournalentryData);
  }
}
