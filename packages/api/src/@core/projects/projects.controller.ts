import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ProjectsController.name);
  }

  @ApiOperation({ operationId: 'getProjects', summary: 'Retrieve projects' })
  @ApiResponse({ status: 200 })
  @Get()
  getProjects() {
    return this.projectsService.getProjects();
  }

  @ApiOperation({
    operationId: 'getProjectsByUser',
    summary: 'Retrieve projects by user',
  })
  @ApiResponse({ status: 200 })
  @Get(':userId')
  getProjectsByUser(@Param('userId') userId: string) {
    return this.projectsService.getProjectsByUser(userId);
  }

  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  createProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }
}
