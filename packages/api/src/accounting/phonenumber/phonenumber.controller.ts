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
import { PhonenumberService } from './services/phonenumber.service';
import { UnifiedPhonenumberInput, UnifiedPhonenumberOutput  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('accounting/phonenumber')
@Controller('accounting/phonenumber')
export class PhonenumberController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly phonenumberService: PhonenumberService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(PhonenumberController.name);
  }

  @ApiOperation({
    operationId: 'getPhonenumbers',
    summary: 'List a batch of Phonenumbers',
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
  @ApiCustomResponse(UnifiedPhonenumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getPhonenumbers(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.phonenumberService.getPhonenumbers(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getPhonenumber',
    summary: 'Retrieve a Phonenumber',
    description: 'Retrieve a phonenumber from any connected Accounting software',
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
  @ApiCustomResponse(UnifiedPhonenumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getPhonenumber(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.phonenumberService.getPhonenumber(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addPhonenumber',
    summary: 'Create a Phonenumber',
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
  @ApiBody({ type: UnifiedPhonenumberInput })
  @ApiCustomResponse(UnifiedPhonenumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addPhonenumber(
    @Body() unifiedPhonenumberData: UnifiedPhonenumberInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.phonenumberService.addPhonenumber(
        unifiedPhonenumberData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addPhonenumbers',
    summary: 'Add a batch of Phonenumbers',
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
  @ApiBody({ type: UnifiedPhonenumberInput, isArray: true })
  @ApiCustomResponse(UnifiedPhonenumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addPhonenumbers(
    @Body() unfiedPhonenumberData: UnifiedPhonenumberInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.phonenumberService.batchAddPhonenumbers(
        unfiedPhonenumberData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'updatePhonenumber',
    summary: 'Update a Phonenumber',
  })
  @ApiCustomResponse(UnifiedPhonenumberOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  updatePhonenumber(
    @Query('id') id: string,
    @Body() updatePhonenumberData: Partial<UnifiedPhonenumberInput>,
  ) {
    return this.phonenumberService.updatePhonenumber(id, updatePhonenumberData);
  }
}
