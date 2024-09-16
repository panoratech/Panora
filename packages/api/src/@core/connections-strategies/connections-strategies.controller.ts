import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConnectionsStrategiesService } from './connections-strategies.service';
import { CreateConnectionStrategyDto } from './dto/create-connections-strategies.dto';
import { ToggleStrategyDto } from './dto/toggle.dto';
import { DeleteCSDto } from './dto/delete-cs.dto';
import { UpdateCSDto } from './dto/update-cs.dto';
import { ConnectionStrategyCredentials } from './dto/get-connection-cs-credentials.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

@ApiTags('connection_strategies')
@ApiExcludeController()
@Controller('connection_strategies')
export class ConnectionsStrategiesController {
  constructor(
    private logger: LoggerService,
    private readonly connectionsStrategiesService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(ConnectionsStrategiesController.name);
  }

  @ApiOperation({
    operationId: 'createConnectionStrategy',
    summary: 'Create Connection Strategy',
  })
  @ApiBody({ type: CreateConnectionStrategyDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createConnectionStrategy(
    @Request() req: any,
    @Body() connectionStrategyCreateDto: CreateConnectionStrategyDto,
  ) {
    const { id_project } = req.user;
    const { type, attributes, values, status } = connectionStrategyCreateDto;
    return await this.connectionsStrategiesService.createConnectionStrategy(
      id_project,
      type,
      attributes,
      values,
      status,
    );
  }

  @ApiOperation({
    operationId: 'toggleConnectionStrategy',
    summary: 'Activate/Deactivate Connection Strategy',
  })
  @ApiBody({ type: ToggleStrategyDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async deleteConnectionStrategy(@Body() data: DeleteCSDto) {
    return await this.connectionsStrategiesService.deleteConnectionStrategy(
      data.id,
    );
  }

  @ApiOperation({
    operationId: 'updateConnectionStrategy',
    summary: 'Update Connection Strategy',
  })
  @ApiBody({ type: UpdateCSDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updateConnectionStrategy(@Body() updateData: UpdateCSDto) {
    const { attributes, id_cs, status, values } = updateData;
    // validate user against project_id
    return await this.connectionsStrategiesService.updateConnectionStrategy(
      id_cs,
      status,
      attributes,
      values,
    );
  }

  @ApiOperation({
    operationId: 'getConnectionStrategyCredentials',
    summary: 'Get Connection Strategy Credential',
  })
  @ApiBody({ type: ConnectionStrategyCredentials })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('credentials')
  async getConnectionStrategyCredential(
    @Request() req: any,
    @Body() data: ConnectionStrategyCredentials,
  ) {
    // validate user against project_id
    const { id_project } = req.user;
    const { attributes, type } = data;
    return await this.connectionsStrategiesService.getConnectionStrategyData(
      id_project,
      type,
      attributes,
    );
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
    return await this.connectionsStrategiesService.getSafeCredentials(
      projectId,
      type,
    );
  }

  @ApiOperation({
    operationId: 'getConnectionStrategiesForProject',
    summary: 'Fetch All Connection Strategies for Project',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('getConnectionStrategiesForProject')
  async getConnectionStrategiesForProject(@Request() req: any) {
    const { id_project } = req.user;
    return await this.connectionsStrategiesService.getConnectionStrategiesForProject(
      id_project,
    );
  }

  //TODO: add scopes maybe for a provider ?
}
