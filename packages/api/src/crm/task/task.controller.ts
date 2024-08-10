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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  //ApiKeyAuth,
} from '@nestjs/swagger';

import { TaskService } from './services/task.service';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';


@ApiTags('crm/tasks')
@Controller('crm/tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TaskController.name);
  }

  @ApiOperation({
    operationId: 'listCrmTask',
    summary: 'List Tasks',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedCrmTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getTasks(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;

      return this.taskService.getTasks(
        connectionId,
        projectId,
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
    operationId: 'retrieveCrmTask',
    summary: 'Retrieve Tasks',
    description: 'Retrieve Tasks from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the task you want to retrieve.',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
    example: false,
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedCrmTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.taskService.getTask(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createCrmTask',
    summary: 'Create Tasks',
    description: 'Create Tasks in any supported Crm software',
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
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiBody({ type: UnifiedCrmTaskInput })
  @ApiPostCustomResponse(UnifiedCrmTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTask(
    @Body() unifiedTaskData: UnifiedCrmTaskInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taskService.addTask(
        unifiedTaskData,
        connectionId,
        projectId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
