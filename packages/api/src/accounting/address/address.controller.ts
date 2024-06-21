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
import { AddressService } from './services/address.service';
import {
  UnifiedAddressInput,
  UnifiedAddressOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/address')
@Controller('accounting/address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(AddressController.name);
  }

  @ApiOperation({
    operationId: 'getAddresss',
    summary: 'List a batch of Addresss',
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
  @ApiCustomResponse(UnifiedAddressOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getAddresss(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.addressService.getAddresss(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getAddress',
    summary: 'Retrieve a Address',
    description: 'Retrieve a address from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the address you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedAddressOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getAddress(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.addressService.getAddress(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addAddress',
    summary: 'Create a Address',
    description: 'Create a address in any supported Accounting software',
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
  @ApiBody({ type: UnifiedAddressInput })
  @ApiCustomResponse(UnifiedAddressOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addAddress(
    @Body() unifiedAddressData: UnifiedAddressInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.addressService.addAddress(
        unifiedAddressData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
