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
import { AutomationService } from './services/automation.service';
import {
  UnifiedAutomationInput,
  UnifiedAutomationOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/automation')
@Controller('marketingautomation/automation')
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(AutomationController.name);
  }

  @ApiOperation({
    operationId: 'getAutomations',
    summary: 'List a batch of Automations',
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
  @ApiCustomResponse(UnifiedAutomationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getAutomations(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.automationService.getAutomations(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getAutomation',
    summary: 'Retrieve a Automation',
    description:
      'Retrieve a automation from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the automation you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedAutomationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getAutomation(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.automationService.getAutomation(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addAutomation',
    summary: 'Create a Automation',
    description:
      'Create a automation in any supported Marketingautomation software',
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
  @ApiBody({ type: UnifiedAutomationInput })
  @ApiCustomResponse(UnifiedAutomationOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addAutomation(
    @Body() unifiedAutomationData: UnifiedAutomationInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.automationService.addAutomation(
        unifiedAutomationData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
