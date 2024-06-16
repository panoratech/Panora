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
import { CreditnoteService } from './services/creditnote.service';
import { UnifiedCreditnoteInput, UnifiedCreditnoteOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/creditnote')
@Controller('accounting/creditnote')
export class CreditnoteController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly creditnoteService: CreditnoteService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CreditnoteController.name);
  }

  @ApiOperation({
    operationId: 'getCreditnotes',
    summary: 'List a batch of Creditnotes',
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
  @ApiCustomResponse(UnifiedCreditnoteOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCreditnotes(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.creditnoteService.getCreditnotes(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCreditnote',
    summary: 'Retrieve a Creditnote',
    description: 'Retrieve a creditnote from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the creditnote you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedCreditnoteOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCreditnote(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.creditnoteService.getCreditnote(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCreditnote',
    summary: 'Create a Creditnote',
    description: 'Create a creditnote in any supported Accounting software',
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
  @ApiBody({ type: UnifiedCreditnoteInput })
  @ApiCustomResponse(UnifiedCreditnoteOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCreditnote(
    @Body() unifiedCreditnoteData: UnifiedCreditnoteInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.creditnoteService.addCreditnote(
        unifiedCreditnoteData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addCreditnotes',
    summary: 'Add a batch of Creditnotes',
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
  @ApiBody({ type: UnifiedCreditnoteInput, isArray: true })
  @ApiCustomResponse(UnifiedCreditnoteOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addCreditnotes(
    @Body() unfiedCreditnoteData: UnifiedCreditnoteInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.creditnoteService.batchAddCreditnotes(
        unfiedCreditnoteData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateCreditnote',
    summary: 'Update a Creditnote',
  })
  @ApiCustomResponse(UnifiedCreditnoteOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateCreditnote(
    @Query('id') id: string,
    @Body() updateCreditnoteData: Partial<UnifiedCreditnoteInput>,
  ) {
    return this.creditnoteService.updateCreditnote(id, updateCreditnoteData);
  }
}
