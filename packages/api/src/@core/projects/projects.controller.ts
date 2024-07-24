import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('projects')
@ApiExcludeController()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ProjectsController.name);
  }

  @ApiOperation({
    operationId: 'getCurrentProject',
    summary: 'Retrieve the current project of the authenticated user',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(ApiKeyAuthGuard)
  @Get('current')
  getCurrentProject(@Request() req: any) {
    const projectId = req.user.id_project;
    return projectId;
  }

  @ApiOperation({ operationId: 'getProjects', summary: 'Retrieve projects' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get()
  getProjects(@Request() req: any) {
    const user_id = req.user.id_user;
    return this.projectsService.getProjectsByUser(user_id);
  }

  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  createProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }
}
