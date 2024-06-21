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
import { CampaignService } from './services/campaign.service';
import {
  UnifiedCampaignInput,
  UnifiedCampaignOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/campaign')
@Controller('marketingautomation/campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CampaignController.name);
  }

  @ApiOperation({
    operationId: 'getCampaigns',
    summary: 'List a batch of Campaigns',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedCampaignOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCampaigns(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.campaignService.getCampaigns(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCampaign',
    summary: 'Retrieve a Campaign',
    description:
      'Retrieve a campaign from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the campaign you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedCampaignOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCampaign(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.campaignService.getCampaign(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCampaign',
    summary: 'Create a Campaign',
    description:
      'Create a campaign in any supported Marketingautomation software',
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
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiBody({ type: UnifiedCampaignInput })
  @ApiCustomResponse(UnifiedCampaignOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCampaign(
    @Body() unifiedCampaignData: UnifiedCampaignInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.campaignService.addCampaign(
        unifiedCampaignData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
