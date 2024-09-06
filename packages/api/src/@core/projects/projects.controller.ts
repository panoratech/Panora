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
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CreateProjectDto, ProjectResponse } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import {
  ApiGetArrayCustomResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';

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
  @ApiGetArrayCustomResponse(ProjectResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  getProjects(@Request() req: any) {
    const user_id = req.user.id_user;
    return this.projectsService.getProjectsByUser(user_id);
  }

  @ApiOperation({ operationId: 'getProjects', summary: 'Retrieve projects' })
  @ApiGetArrayCustomResponse(ProjectResponse)
  @UseGuards(JwtAuthGuard)
  @Get('internal')
  @ApiExcludeEndpoint()
  getProjectsInternal(@Request() req: any) {
    const user_id = req.user.id_user;
    return this.projectsService.getProjectsByUser(user_id);
  }

  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiPostCustomResponse(ProjectResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  createProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }

  @ApiOperation({ operationId: 'createProject', summary: 'Create a project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiPostCustomResponse(ProjectResponse)
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Post('internal')
  createInternalProject(@Body() projectCreateDto: CreateProjectDto) {
    return this.projectsService.createProject(projectCreateDto);
  }
}
