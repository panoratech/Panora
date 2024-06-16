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
import { CompanyinfoService } from './services/companyinfo.service';
import { UnifiedCompanyinfoInput, UnifiedCompanyinfoOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/companyinfo')
@Controller('accounting/companyinfo')
export class CompanyinfoController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly companyinfoService: CompanyinfoService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CompanyinfoController.name);
  }

  @ApiOperation({
    operationId: 'getCompanyinfos',
    summary: 'List a batch of Companyinfos',
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
  @ApiCustomResponse(UnifiedCompanyinfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCompanyinfos(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.companyinfoService.getCompanyinfos(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCompanyinfo',
    summary: 'Retrieve a Companyinfo',
    description: 'Retrieve a companyinfo from any connected Accounting software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the companyinfo you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedCompanyinfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCompanyinfo(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.companyinfoService.getCompanyinfo(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addCompanyinfo',
    summary: 'Create a Companyinfo',
    description: 'Create a companyinfo in any supported Accounting software',
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
  @ApiBody({ type: UnifiedCompanyinfoInput })
  @ApiCustomResponse(UnifiedCompanyinfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCompanyinfo(
    @Body() unifiedCompanyinfoData: UnifiedCompanyinfoInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.companyinfoService.addCompanyinfo(
        unifiedCompanyinfoData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addCompanyinfos',
    summary: 'Add a batch of Companyinfos',
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
  @ApiBody({ type: UnifiedCompanyinfoInput, isArray: true })
  @ApiCustomResponse(UnifiedCompanyinfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addCompanyinfos(
    @Body() unfiedCompanyinfoData: UnifiedCompanyinfoInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.companyinfoService.batchAddCompanyinfos(
        unfiedCompanyinfoData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updateCompanyinfo',
    summary: 'Update a Companyinfo',
  })
  @ApiCustomResponse(UnifiedCompanyinfoOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateCompanyinfo(
    @Query('id') id: string,
    @Body() updateCompanyinfoData: Partial<UnifiedCompanyinfoInput>,
  ) {
    return this.companyinfoService.updateCompanyinfo(id, updateCompanyinfoData);
  }
}
