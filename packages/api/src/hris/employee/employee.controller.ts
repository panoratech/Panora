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
import { EmployeeService } from './services/employee.service';
import {
  UnifiedEmployeeInput,
  UnifiedEmployeeOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

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
    operationId: 'getEmployees',
    summary: 'List a batch of Employees',
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
  @ApiCustomResponse(UnifiedEmployeeOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async getEmployees(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.employeeService.getEmployees(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getEmployee',
    summary: 'Retrieve a Employee',
    description: 'Retrieve a employee from any connected Hris software',
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
  @ApiCustomResponse(UnifiedEmployeeOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getEmployee(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.employeeService.getEmployee(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addEmployee',
    summary: 'Create a Employee',
    description: 'Create a employee in any supported Hris software',
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
  @ApiBody({ type: UnifiedEmployeeInput })
  @ApiCustomResponse(UnifiedEmployeeOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addEmployee(
    @Body() unifiedEmployeeData: UnifiedEmployeeInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.employeeService.addEmployee(
        unifiedEmployeeData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
