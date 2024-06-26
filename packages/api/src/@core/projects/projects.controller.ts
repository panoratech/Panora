import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

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
