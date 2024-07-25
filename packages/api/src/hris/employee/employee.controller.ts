import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { EmployeeService } from './services/employee.service';
import {
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';

@ApiBearerAuth('bearer')
@ApiTags('hris/employee')
@Controller('hris/employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(EmployeeController.name);
  }

  @ApiOperation({
    operationId: 'listHrisEmployee',
    summary: 'List a batch of Employees',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedHrisEmployeeOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getEmployees(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.employeeService.getEmployees(
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
    operationId: 'retrieveHrisEmployee',
    summary: 'Retrieve an Employee',
    description: 'Retrieve an employee from any connected Hris software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the employee you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Hris software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedHrisEmployeeOutput)
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
    return this.employeeService.getEmployee(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createHrisEmployee',
    summary: 'Create an Employee',
    description: 'Create an employee in any supported Hris software',
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
  @ApiBody({ type: UnifiedHrisEmployeeInput })
  @ApiPostCustomResponse(UnifiedHrisEmployeeOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addEmployee(
    @Body() unifiedEmployeeData: UnifiedHrisEmployeeInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.employeeService.addEmployee(
        unifiedEmployeeData,
        connectionId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
