import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LinkedUsersService } from './linked-users.service';
import { LoggerService } from '../logger/logger.service';
import { CreateLinkedUserDto } from './dto/create-linked-user.dto';

@Controller('linked-users')
export class LinkedUsersController {
  constructor(
    private readonly linkedUsersService: LinkedUsersService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LinkedUsersController.name);
  }

  @Post('create')
  addLinkedUser(@Body() linkedUserCreateDto: CreateLinkedUserDto) {
    return this.linkedUsersService.addLinkedUser(linkedUserCreateDto);
  }
  @Get()
  getLinkedUsers() {
    return this.linkedUsersService.getLinkedUsers();
  }
  @Get('single')
  getLinkedUser(@Query('id') id: string) {
    return this.linkedUsersService.getLinkedUser(id);
  }
}
