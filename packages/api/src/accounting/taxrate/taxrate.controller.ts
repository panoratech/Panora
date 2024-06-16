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
import { TaxrateService } from './services/taxrate.service';
import { UnifiedTaxrateInput, UnifiedTaxrateOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/taxrate')
@Controller('accounting/taxrate')
export class TaxrateController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly taxrateService: TaxrateService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TaxrateController.name);
  }

  @ApiOperation({
    operationId: 'getTaxrates',
    summary: 'List a batch of Taxrates',
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
  @ApiCustomResponse(UnifiedTaxrateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTaxrates(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.taxrateService.getTaxrates(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTaxrate',
    summary: 'Retrieve a Taxrate',
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
  @ApiCustomResponse(UnifiedTaxrateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTaxrate(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.taxrateService.getTaxrate(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTaxrate',
    summary: 'Create a Taxrate',
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
  @ApiBody({ type: UnifiedTaxrateInput })
  @ApiCustomResponse(UnifiedTaxrateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTaxrate(
    @Body() unifiedTaxrateData: UnifiedTaxrateInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.taxrateService.addTaxrate(
        unifiedTaxrateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addTaxrates',
    summary: 'Add a batch of Taxrates',
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
  @ApiBody({ type: UnifiedTaxrateInput, isArray: true })
  @ApiCustomResponse(UnifiedTaxrateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addTaxrates(
    @Body() unfiedTaxrateData: UnifiedTaxrateInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.taxrateService.batchAddTaxrates(
        unfiedTaxrateData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateTaxrate',
    summary: 'Update a Taxrate',
  })
  @ApiCustomResponse(UnifiedTaxrateOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateTaxrate(
    @Query('id') id: string,
    @Body() updateTaxrateData: Partial<UnifiedTaxrateInput>,
  ) {
    return this.taxrateService.updateTaxrate(id, updateTaxrateData);
  }
}
