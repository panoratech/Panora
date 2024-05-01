import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

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
  @Post('create')
  createProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }
}
