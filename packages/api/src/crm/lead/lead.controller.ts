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
import { LeadService } from './services/lead.service';
import { UnifiedLeadInput, UnifiedLeadOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/lead')
@Controller('crm/lead')
export class LeadController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly leadService: LeadService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LeadController.name);
  }

  @ApiOperation({
    operationId: 'getLeads',
    summary: 'List a batch of Leads',
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
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedLeadOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getLeads(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.leadService.getLeads(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getLead',
    summary: 'Retrieve a Lead',
    description: 'Retrieve a lead from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the lead you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedLeadOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getLead(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.leadService.getLead(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addLead',
    summary: 'Create a Lead',
    description: 'Create a lead in any supported Crm software',
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
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedLeadInput })
  @ApiCustomResponse(UnifiedLeadOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addLead(
    @Body() unifiedLeadData: UnifiedLeadInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.leadService.addLead(
        unifiedLeadData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addLeads',
    summary: 'Add a batch of Leads',
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
    description:
      'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedLeadInput, isArray: true })
  @ApiCustomResponse(UnifiedLeadOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addLeads(
    @Body() unfiedLeadData: UnifiedLeadInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.leadService.batchAddLeads(
        unfiedLeadData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateLead',
    summary: 'Update a Lead',
  })
  @ApiCustomResponse(UnifiedLeadOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateLead(
    @Query('id') id: string,
    @Body() updateLeadData: Partial<UnifiedLeadInput>,
  ) {
    return this.leadService.updateLead(id, updateLeadData);
  }
}
