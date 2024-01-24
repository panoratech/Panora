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
import { EngagementService } from './services/engagement.service';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/engagements')
@Controller('crm/engagements')
export class EngagementController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly engagementService: EngagementService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(EngagementController.name);
  }

  @ApiOperation({
    operationId: 'getEngagements',
    summary: 'List a batch of Engagements',
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
  @ApiCustomResponse(UnifiedEngagementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getEngagements(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.engagementService.getEngagements(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getEngagement',
    summary: 'Retrieve a Engagement',
    description: 'Retrieve a engagement from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the engagement you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedEngagementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getEngagement(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.engagementService.getEngagement(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addEngagement',
    summary: 'Create a Engagement',
    description: 'Create a engagement in any supported Crm software',
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
  @ApiBody({ type: UnifiedEngagementInput })
  @ApiCustomResponse(UnifiedEngagementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addEngagement(
    @Body() unifiedEngagementData: UnifiedEngagementInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.engagementService.addEngagement(
        unifiedEngagementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addEngagements',
    summary: 'Add a batch of Engagements',
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
  @ApiBody({ type: UnifiedEngagementInput, isArray: true })
  @ApiCustomResponse(UnifiedEngagementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addEngagements(
    @Body() unfiedEngagementData: UnifiedEngagementInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.engagementService.batchAddEngagements(
        unfiedEngagementData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'updateEngagement',
    summary: 'Update a Engagement',
  })
  @ApiCustomResponse(UnifiedEngagementOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateEngagement(
    @Query('id') id: string,
    @Body() updateEngagementData: Partial<UnifiedEngagementInput>,
  ) {
    return this.engagementService.updateEngagement(id, updateEngagementData);
  }
}
