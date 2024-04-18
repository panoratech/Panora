import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConnectionsStrategiesService } from './connections-strategies.service';
import { CreateConnectionStrategyDto } from './dto/create-connections-strategies.dto';
import { ToggleStrategyDto } from './dto/toggle.dto';
import { GetConnectionStrategyDto } from './dto/get-connections.dto';
import { DeleteCSDto } from './dto/delete-cs.dto';
import { UpdateCSDto } from './dto/update-cs.dto';
import { ConnectionStrategyCredentials } from './dto/get-connection-cs-credentials.dto';

@ApiTags('connections-strategies')
@Controller('connections-strategies')
export class ConnectionsStrategiesController {
  constructor(
    private logger: LoggerService,
    private readonly connectionsStrategiesService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(ConnectionsStrategiesController.name);
  }

  /*@ApiOperation({
    operationId: 'isCustomCredentials',
    summary:
      'Fetch info on whether the customer uses custom credentials for connections',
  })
  @ApiResponse({ status: 200 })
  @Get('isCustomCredentials')
  async isCustomCredentials(
    @Query('projectId') projectId: string,
    @Query('type') type: string,
  ) {
    return await this.connectionsStrategiesService.isCustomCredentials(
      projectId,
      type,
    );
  }*/

  @ApiOperation({
    operationId: 'createConnectionStrategy',
    summary: 'Create Connection Strategy',
  })
  @ApiBody({ type: CreateConnectionStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  async createConnectionStrategy(
    @Body() connectionStrategyCreateDto: CreateConnectionStrategyDto,
  ) {
    const { projectId, type, attributes, values } = connectionStrategyCreateDto;
    return await this.connectionsStrategiesService.createConnectionStrategy(
      projectId,
      type,
      attributes,
      values,
    );
  }

  /*@ApiOperation({
    operationId: 'getConnectionStrategyData',
    summary: 'Get Connection Strategy Data',
  })
  @ApiBody({ type: GetConnectionStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('get')
  async getConnectionStrategyData(
    @Body() connectionStrategyCreateDto: GetConnectionStrategyDto,
  ) {
    const { projectId, type, attributes } = connectionStrategyCreateDto;
    return await this.connectionsStrategiesService.getConnectionStrategyData(
      projectId,
      type,
      attributes,
    );
  }*/

  @ApiOperation({
    operationId: 'toggleConnectionStrategy',
    summary: 'Activate/Deactivate Connection Strategy',
  })
  @ApiBody({ type: ToggleStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('toggle')
  async toggleConnectionStrategy(@Body() data: ToggleStrategyDto) {
    return await this.connectionsStrategiesService.toggle(data.id_cs);
  }

  @ApiOperation({
    operationId: 'deleteConnectionStrategy',
    summary: 'Delete Connection Strategy',
  })
  @ApiBody({ type: DeleteCSDto })
  @ApiResponse({ status: 201 })
  @Post('delete')
  async deleteConnectionStrategy(@Body() data: DeleteCSDto) {
    return await this.connectionsStrategiesService.deleteConnectionStrategy(data.id);
  }

  @ApiOperation({
    operationId: 'updateConnectionStrategy',
    summary: 'Update Connection Strategy',
  })
  @ApiBody({ type: UpdateCSDto })
  @ApiResponse({ status: 201 })
  @Post('update')
  async updateConnectionStrategy(@Body() updateData: UpdateCSDto) {
    const { attributes, id_cs, status, values } = updateData
    return await this.connectionsStrategiesService.updateConnectionStrategy(id_cs, status, attributes, values);
  }

  @ApiOperation({
    operationId: 'getConnectionStrategyCredentials',
    summary: 'Get Connection Strategy Credential',
  })
  @ApiBody({ type: ConnectionStrategyCredentials })
  @ApiResponse({ status: 201 })
  @Post('credentials')
  async getConnectionStrategyCredential(@Body() data: ConnectionStrategyCredentials) {
    const { attributes, projectId, type } = data
    return await this.connectionsStrategiesService.getConnectionStrategyData(projectId, type, attributes);
  }

  @ApiOperation({
    operationId: 'getCredentials',
    summary: 'Fetch credentials info needed for connections',
  })
  @ApiResponse({ status: 200 })
  @Get('getCredentials')
  async getCredentials(
    @Query('projectId') projectId: string,
    @Query('type') type: string,
  ) {
    return await this.connectionsStrategiesService.getCredentials(
      projectId,
      type,
    );
  }

  @ApiOperation({
    operationId: 'getConnectionStrategiesForProject',
    summary: 'Fetch All Connection Strategies for Project'
  })
  @ApiResponse({ status: 200 })
  @Get('GetConnectionStrategiesForProject')
  async getConnectionStrategiesForProject(
    @Query('projectId') projectId: string,
  ) {
    return await this.connectionsStrategiesService.getConnectionStrategiesForProject(projectId)
  }


  //TODO: add scopes maybe for a provider ?
}
