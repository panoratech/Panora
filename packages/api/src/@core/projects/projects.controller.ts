import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ProjectsController.name);
  }

  @Get()
  getProjects() {
    return this.projectsService.getProjects();
  }

  @Post('create')
  createProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }
}
