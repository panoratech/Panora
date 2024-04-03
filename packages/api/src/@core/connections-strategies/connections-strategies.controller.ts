import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '@@core/logger/logger.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getProviderVertical, ProviderVertical } from '@panora/shared';
import { ConnectionsStrategiesService } from './connections-strategies.service';
import { CreateConnectionStrategyDto } from './dto/create-connections-strategies.dto';
import { ToggleStrategyDto } from './dto/toggle.dto';
import { GetConnectionStrategyDto } from './dto/get-connections.dto';

@ApiTags('connections-strategies')
@Controller('connections-strategies')
export class ConnectionsStrategiesController {
  constructor(
    private logger: LoggerService,
    private readonly connectionsStrategiesService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(ConnectionsStrategiesController.name);
  }

  @ApiOperation({
    operationId: 'isCustomCredentials',
    summary: 'Fetch info on whether the customer uses custom credentials for connections',
  })
  @ApiResponse({ status: 200 })
  @Get('isCustomCredentials')
  async isCustomCredentials(@Query('projectId') projectId: string, @Query('type') type: string) {
    return await this.connectionsStrategiesService.isCustomCredentials(projectId, type);
  }

  @ApiOperation({ operationId: 'createConnectionStrategy', summary: 'Create Connection Strategy' })
  @ApiBody({ type: CreateConnectionStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  async createConnectionStrategy(@Body() connectionStrategyCreateDto: CreateConnectionStrategyDto) {
    const {projectId, type , attributes, values} = connectionStrategyCreateDto;
    return await this.connectionsStrategiesService.createConnectionStrategy(projectId, type , attributes, values);
  }

  @ApiOperation({ operationId: 'getConnectionStrategyData', summary: 'Get Connection Strategy Data' })
  @ApiBody({ type: GetConnectionStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('get')
  async getConnectionStrategyData(@Body() connectionStrategyCreateDto: GetConnectionStrategyDto) {
    const {projectId, type , attributes} = connectionStrategyCreateDto;
    return await this.connectionsStrategiesService.getConnectionStrategyData(projectId, type , attributes);
  }

  @ApiOperation({ operationId: 'toggleConnectionStrategy', summary: 'Activate/Deactivate Connection Strategy' })
  @ApiBody({ type: ToggleStrategyDto })
  @ApiResponse({ status: 201 })
  @Post('toggle')
  async toggleConnectionStrategy(@Body() data: ToggleStrategyDto) {
    return await this.connectionsStrategiesService.toggle(data.id);
  }

}