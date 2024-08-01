import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  //ApiKeyAuth,
} from '@nestjs/swagger';

import { JournalEntryService } from './services/journalentry.service';
import {
  UnifiedAccountingJournalentryInput,
  UnifiedAccountingJournalentryOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';

//@ApiKeyAuth()
@ApiTags('accounting/journalentries')
@Controller('accounting/journalentries')
export class JournalEntryController {
  constructor(
    private readonly journalentryService: JournalEntryService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(JournalEntryController.name);
  }

  @ApiOperation({
    operationId: 'listAccountingJournalEntry',
    summary: 'List  JournalEntrys',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedAccountingJournalentryOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getJournalEntrys(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.journalentryService.getJournalEntrys(
        connectionId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveAccountingJournalEntry',
    summary: 'Retrieve Journal Entries',
    description:
      'Retrieve Journal Entries from any connected Accounting software',
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
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedAccountingJournalentryOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.journalentryService.getJournalEntry(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createAccountingJournalEntry',
    summary: 'Create Journal Entries',
    description: 'Create Journal Entries in any supported Accounting software',
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
  @ApiBody({ type: UnifiedAccountingJournalentryInput })
  @ApiPostCustomResponse(UnifiedAccountingJournalentryOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addJournalEntry(
    @Body() unifiedJournalEntryData: UnifiedAccountingJournalentryInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.journalentryService.addJournalEntry(
        unifiedJournalEntryData,
        connectionId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
