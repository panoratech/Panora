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
import { TemplateService } from './services/template.service';
import {
  UnifiedTemplateInput,
  UnifiedTemplateOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/template')
@Controller('marketingautomation/template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TemplateController.name);
  }

  @ApiOperation({
    operationId: 'getTemplates',
    summary: 'List a batch of Templates',
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
  @ApiCustomResponse(UnifiedTemplateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTemplates(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.templateService.getTemplates(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTemplate',
    summary: 'Retrieve a Template',
    description:
      'Retrieve a template from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the template you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedTemplateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTemplate(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.templateService.getTemplate(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTemplate',
    summary: 'Create a Template',
    description:
      'Create a template in any supported Marketingautomation software',
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
  @ApiBody({ type: UnifiedTemplateInput })
  @ApiCustomResponse(UnifiedTemplateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTemplate(
    @Body() unifiedTemplateData: UnifiedTemplateInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.templateService.addTemplate(
        unifiedTemplateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
