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
import { PhoneNumberService } from './services/phonenumber.service';
import {
  UnifiedPhoneNumberInput,
  UnifiedPhoneNumberOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/phonenumber')
@Controller('accounting/phonenumber')
export class PhoneNumberController {
  constructor(
    private readonly phonenumberService: PhoneNumberService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(PhoneNumberController.name);
  }

  @ApiOperation({
    operationId: 'getPhoneNumbers',
    summary: 'List a batch of PhoneNumbers',
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
  @ApiCustomResponse(UnifiedPhoneNumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPhoneNumbers(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.phonenumberService.getPhoneNumbers(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPhoneNumber',
    summary: 'Retrieve a PhoneNumber',
    description:
      'Retrieve a phonenumber from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the phonenumber you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedPhoneNumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPhoneNumber(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.phonenumberService.getPhoneNumber(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPhoneNumber',
    summary: 'Create a PhoneNumber',
    description: 'Create a phonenumber in any supported Accounting software',
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
  @ApiBody({ type: UnifiedPhoneNumberInput })
  @ApiCustomResponse(UnifiedPhoneNumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPhoneNumber(
    @Body() unifiedPhoneNumberData: UnifiedPhoneNumberInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.phonenumberService.addPhoneNumber(
        unifiedPhoneNumberData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
