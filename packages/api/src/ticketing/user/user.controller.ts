import { Controller, Query, Get, Param, Headers } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { UserService } from './services/user.service';

@ApiTags('ticketing/user')
@Controller('ticketing/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({
    operationId: 'getUsers',
    summary: 'List a batch of Users',
  })
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(UserResponse)
  @Get()
  getUsers(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.userService.getUsers(integrationId, linkedUserId, remote_data);
  }

  @ApiOperation({
    operationId: 'getUser',
    summary: 'Retrieve a User',
    description: 'Retrieve a user from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the user you want to retrieve.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(UserResponse)
  @Get(':id')
  getUser(@Param('id') id: string, @Query('remoteData') remote_data?: boolean) {
    return this.userService.getUser(id, remote_data);
  }
}
