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
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

@ApiTags('linked-users')
@Controller('linked-users')
export class LinkedUsersController {
  constructor(
    private readonly linkedUsersService: LinkedUsersService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LinkedUsersController.name);
  }

  @ApiOperation({ operationId: 'addLinkedUser', summary: 'Add Linked User' })
  @ApiBody({ type: CreateLinkedUserDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  addLinkedUser(@Body() linkedUserCreateDto: CreateLinkedUserDto) {
    return this.linkedUsersService.addLinkedUser(linkedUserCreateDto);
  }

  @ApiOperation({
    operationId: 'addBatchLinkedUsers',
    summary: 'Add Batch Linked Users',
  })
  @ApiBody({ type: CreateBatchLinkedUserDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('batch')
  addBatchLinkedUsers(@Body() data: CreateBatchLinkedUserDto) {
    return this.linkedUsersService.addBatchLinkedUsers(data);
  }

  @ApiOperation({
    operationId: 'fetchLinkedUsers',
    summary: 'Retrieve Linked Users',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get()
  fetchLinkedUsers(@Request() req: any) {
    const { id_project } = req.user;
    return this.linkedUsersService.getLinkedUsers(id_project);
  }

  @ApiOperation({
    operationId: 'getLinkedUser',
    summary: 'Retrieve a Linked User',
  })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('single')
  getLinkedUser(@Query('id') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUser(id);
  }

  @ApiOperation({
    operationId: 'linkedUserFromRemoteId',
    summary: 'Retrieve a Linked User From A Remote Id',
  })
  @ApiQuery({ name: 'remoteId', required: true, type: String })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('fromRemoteId')
  linkedUserFromRemoteId(@Query('remoteId') id: string) {
    // validate project_id against user
    return this.linkedUsersService.getLinkedUserV2(id);
  }
}
