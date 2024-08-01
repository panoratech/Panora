import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LinkedUsersService } from './linked-users.service';
import { LoggerService } from '../@core-services/logger/logger.service';
import {
  CreateBatchLinkedUserDto,
  CreateLinkedUserDto,
} from './dto/create-linked-user.dto';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('linkedUsers')
@Controller('linked_users')
export class LinkedUsersController {
  constructor(
    private readonly linkedUsersService: LinkedUsersService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LinkedUsersController.name);
  }

  @ApiOperation({ operationId: 'createLinkedUser', summary: 'Create Linked Users' })
  @ApiBody({ type: CreateLinkedUserDto })
  @ApiResponse({ status: 201 })
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  addLinkedUser(
    @Request() req: any,
    @Body() linkedUserCreateDto: CreateLinkedUserDto,
  ) {
    const projectId = req.user.id_project;
    return this.linkedUsersService.addLinkedUser(
      linkedUserCreateDto,
      projectId,
    );
  }

  @ApiOperation({
    operationId: 'importBatch',
    summary: 'Add Batch Linked Users',
  })
  @ApiBody({ type: CreateBatchLinkedUserDto })
  @ApiResponse({ status: 201 })
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  addBatchLinkedUsers(
    @Request() req: any,
    @Body() data: CreateBatchLinkedUserDto,
  ) {
    const projectId = req.user.id_project;
    return this.linkedUsersService.addBatchLinkedUsers(data, projectId);
  }

  @ApiOperation({
    operationId: 'listLinkedUsers',
    summary: 'List Linked Users',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  fetchLinkedUsers(@Request() req: any) {
    const { id_project } = req.user;
    return this.linkedUsersService.getLinkedUsers(id_project);
  }

  @ApiOperation({
    operationId: 'retrieveLinkedUser',
    summary: 'Retrieve Linked Users',
  })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @UseGuards(ApiKeyAuthGuard)
  @Get('single')
  getLinkedUser(@Query('id') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUser(id);
  }

  @ApiOperation({
    operationId: 'remoteId',
    summary: 'Retrieve a Linked User From A Remote Id',
  })
  @ApiQuery({ name: 'remoteId', required: true, type: String })
  @ApiResponse({ status: 200 })
  @UseGuards(ApiKeyAuthGuard)
  @Get('fromRemoteId')
  linkedUserFromRemoteId(@Query('remoteId') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUserV2(id);
  }

  @ApiOperation({ operationId: 'createLinkedUser', summary: 'Add Linked User' })
  @ApiBody({ type: CreateLinkedUserDto })
  @ApiResponse({ status: 201 })
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Post('internal')
  addLinkedUserInternal(
    @Request() req: any,
    @Body() linkedUserCreateDto: CreateLinkedUserDto,
  ) {
    const { id_project } = req.user;
    return this.linkedUsersService.addLinkedUser(
      linkedUserCreateDto,
      id_project,
    );
  }

  @ApiOperation({
    operationId: 'importBatch',
    summary: 'Add Batch Linked Users',
  })
  @ApiBody({ type: CreateBatchLinkedUserDto })
  @ApiResponse({ status: 201 })
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Post('internal/batch')
  addBatchLinkedUsersInternal(
    @Request() req: any,
    @Body() data: CreateBatchLinkedUserDto,
  ) {
    const { id_project } = req.user;
    return this.linkedUsersService.addBatchLinkedUsers(data, id_project);
  }

  @ApiOperation({
    operationId: 'listLinkedUsers',
    summary: 'Retrieve Linked Users',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Get('internal')
  fetchLinkedUsersInternal(@Request() req: any) {
    const { id_project } = req.user;
    return this.linkedUsersService.getLinkedUsers(id_project);
  }

  @ApiOperation({
    operationId: 'retrieveLinkedUser',
    summary: 'Retrieve a Linked User',
  })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Get('internal/single')
  getLinkedUserInternal(@Query('id') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUser(id);
  }

  @ApiOperation({
    operationId: 'remoteId',
    summary: 'Retrieve a Linked User From A Remote Id',
  })
  @ApiQuery({ name: 'remoteId', required: true, type: String })
  @ApiResponse({ status: 200 })
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Get('internal/fromRemoteId')
  linkedUserFromRemoteIdInternal(@Query('remoteId') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUserV2(id);
  }
}
