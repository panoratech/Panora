import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import { ApiCustomResponse } from '@@core/utils/types';
import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from './services/customer.service';
import { UnifiedCustomerOutput } from './types/model.unified';

@ApiTags('ecommerce/customer')
@Controller('ecommerce/customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(CustomerController.name);
  }

  @ApiOperation({
    operationId: 'getCustomers',
    summary: 'List a batch of Customers',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedCustomerOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCustomers(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.customerService.getCustomers(
        connectionId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCustomer',
    summary: 'Retrieve a Customer',
    description: 'Retrieve a customer from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the customer you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedCustomerOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.customerService.getCustomer(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }
}
