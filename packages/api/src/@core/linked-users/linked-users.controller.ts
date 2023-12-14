import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LinkedUsersService } from './linked-users.service';
import { LoggerService } from '../logger/logger.service';
import { CreateLinkedUserDto } from './dto/create-linked-user.dto';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('linked-users')
@Controller('linked-users')
export class LinkedUsersController {
  constructor(
    private readonly linkedUsersService: LinkedUsersService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LinkedUsersController.name);
  }

  @ApiBody({ type: CreateLinkedUserDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  addLinkedUser(@Body() linkedUserCreateDto: CreateLinkedUserDto) {
    return this.linkedUsersService.addLinkedUser(linkedUserCreateDto);
  }

  @ApiResponse({ status: 200 })
  @Get()
  getLinkedUsers() {
    return this.linkedUsersService.getLinkedUsers();
  }

  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get('single')
  getLinkedUser(@Query('id') id: string) {
    return this.linkedUsersService.getLinkedUser(id);
  }
}
