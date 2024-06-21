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
import { JournalEntryService } from './services/journalentry.service';
import {
  UnifiedJournalEntryInput,
  UnifiedJournalEntryOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/journalentry')
@Controller('accounting/journalentry')
export class JournalEntryController {
  constructor(
    private readonly journalentryService: JournalEntryService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(JournalEntryController.name);
  }

  @ApiOperation({
    operationId: 'getJournalEntrys',
    summary: 'List a batch of JournalEntrys',
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
  @ApiCustomResponse(UnifiedJournalEntryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getJournalEntrys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.journalentryService.getJournalEntrys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getJournalEntry',
    summary: 'Retrieve a JournalEntry',
    description:
      'Retrieve a journalentry from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedJournalEntryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getJournalEntry(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.journalentryService.getJournalEntry(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addJournalEntry',
    summary: 'Create a JournalEntry',
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
  @ApiBody({ type: UnifiedJournalEntryInput })
  @ApiCustomResponse(UnifiedJournalEntryOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addJournalEntry(
    @Body() unifiedJournalEntryData: UnifiedJournalEntryInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.journalentryService.addJournalEntry(
        unifiedJournalEntryData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
