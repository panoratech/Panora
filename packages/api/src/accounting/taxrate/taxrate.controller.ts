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
import { TaxRateService } from './services/taxrate.service';
import {
  UnifiedTaxRateInput,
  UnifiedTaxRateOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/taxrate')
@Controller('accounting/taxrate')
export class TaxRateController {
  constructor(
    private readonly taxrateService: TaxRateService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TaxRateController.name);
  }

  @ApiOperation({
    operationId: 'getTaxRates',
    summary: 'List a batch of TaxRates',
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
  @ApiCustomResponse(UnifiedTaxRateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTaxRates(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taxrateService.getTaxRates(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTaxRate',
    summary: 'Retrieve a TaxRate',
    description: 'Retrieve a taxrate from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the taxrate you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedTaxRateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTaxRate(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.taxrateService.getTaxRate(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTaxRate',
    summary: 'Create a TaxRate',
    description: 'Create a taxrate in any supported Accounting software',
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
  @ApiBody({ type: UnifiedTaxRateInput })
  @ApiCustomResponse(UnifiedTaxRateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTaxRate(
    @Body() unifiedTaxRateData: UnifiedTaxRateInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taxrateService.addTaxRate(
        unifiedTaxRateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
