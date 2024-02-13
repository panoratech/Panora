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
import { TaskService } from './services/task.service';
import { UnifiedTaskInput, UnifiedTaskOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('crm/tasks')
@Controller('crm/tasks')
export class TaskController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly taskService: TaskService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TaskController.name);
  }

  @ApiOperation({
    operationId: 'getTasks',
    summary: 'List a batch of Tasks',
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
  @ApiCustomResponse(UnifiedTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTasks(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taskService.getTasks(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTask',
    summary: 'Retrieve a Task',
    description: 'Retrieve a task from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the task you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTask(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.taskService.getTask(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTask',
    summary: 'Create a Task',
    description: 'Create a task in any supported Crm software',
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
  @ApiBody({ type: UnifiedTaskInput })
  @ApiCustomResponse(UnifiedTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTask(
    @Body() unifiedTaskData: UnifiedTaskInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taskService.addTask(
        unifiedTaskData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addTasks',
    summary: 'Add a batch of Tasks',
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
  @ApiBody({ type: UnifiedTaskInput, isArray: true })
  @ApiCustomResponse(UnifiedTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addTasks(
    @Body() unfiedTaskData: UnifiedTaskInput[],
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.taskService.batchAddTasks(
        unfiedTaskData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'updateTask',
    summary: 'Update a Task',
  })
  @ApiCustomResponse(UnifiedTaskOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateTask(
    @Query('id') id: string,
    @Body() updateTaskData: Partial<UnifiedTaskInput>,
  ) {
    return this.taskService.updateTask(id, updateTaskData);
  }
}
