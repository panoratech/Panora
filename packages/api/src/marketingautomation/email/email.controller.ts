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
import { EmailService } from './services/email.service';
import { UnifiedEmailInput, UnifiedEmailOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('marketingautomation/email')
@Controller('marketingautomation/email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(EmailController.name);
  }

  @ApiOperation({
    operationId: 'getEmails',
    summary: 'List a batch of Emails',
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
  @ApiCustomResponse(UnifiedEmailOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getEmails(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.emailService.getEmails(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getEmail',
    summary: 'Retrieve a Email',
    description:
      'Retrieve a email from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the email you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
  })
  @ApiCustomResponse(UnifiedEmailOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getEmail(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.emailService.getEmail(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addEmail',
    summary: 'Create a Email',
    description: 'Create a email in any supported Marketingautomation software',
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
  @ApiBody({ type: UnifiedEmailInput })
  @ApiCustomResponse(UnifiedEmailOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addEmail(
    @Body() unifiedEmailData: UnifiedEmailInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.emailService.addEmail(
        unifiedEmailData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
