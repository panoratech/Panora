import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectConnectorsService } from './project-connectors.service';
import { ProjectConnectorsDto } from './dto/project-connectors.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
export interface TypeCustom {
  id_project: string;
  crm_hubspot: boolean;
  crm_zoho: boolean;
  crm_zendesk: boolean;
  crm_pipedrive: boolean;
  crm_attio: boolean;
  tcg_zendesk: boolean;
  tcg_gorgias: boolean;
  tcg_front: boolean;
  tcg_jira: boolean;
  tcg_gitlab: boolean;
  crm_close: boolean;
}
@ApiTags('project-connectors')
@Controller('project-connectors')
export class ProjectConnectorsController {
  constructor(
    private readonly projectConnectorsService: ProjectConnectorsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ProjectConnectorsController.name);
  }

  @ApiOperation({
    operationId: 'updateConnectorsToProject',
    summary: 'Update Connectors for a project',
  })
  @ApiBody({ type: ProjectConnectorsDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  async updateConnectorsToProject(
    @Body() projectConnectorsDto: ProjectConnectorsDto,
    @Request() req: any,
  ) {
    const { id_project } = req.user;
    const { column, status } = projectConnectorsDto;
    return await this.projectConnectorsService.updateProjectConnectors(
      column,
      status,
      id_project,
    );
  }

  @Post('create')
  async createConnectorsToProject(@Body() data: TypeCustom) {
    return await this.projectConnectorsService.createProjectConnectors(data);
  }

  @ApiOperation({
    operationId: 'getConnectorsFromProject',
    summary: 'Retrieve connectors by Project Id',
  })
  @ApiQuery({ name: 'getConnectorsFromProject', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get()
  async getConnectorsFromProject(@Query('projectId') id: string) {
    return await this.projectConnectorsService.getConnectorsByProjectId(id);
  }
}
