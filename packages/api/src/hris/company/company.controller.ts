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
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CompanyService } from './services/company.service';

@ApiTags('hris/company')
@Controller('hris/company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CompanyController.name);
  }

  @ApiOperation({
    operationId: 'getCompanys',
    summary: 'List a batch of Companys',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedCompanyOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCompanys(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.companyService.getCompanys(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getHrisCompany',
    summary: 'Retrieve a Company',
    description: 'Retrieve a company from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the company you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiCustomResponse(UnifiedCompanyOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCompany(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.companyService.getCompany(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addHrisCompany',
    summary: 'Create a Company',
    description: 'Create a company in any supported Hris software',
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
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiBody({ type: UnifiedCompanyInput })
  @ApiCustomResponse(UnifiedCompanyOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addCompany(
    @Body() unifiedCompanyData: UnifiedCompanyInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.companyService.addCompany(
        unifiedCompanyData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
