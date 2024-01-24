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
import { UnifiedUserOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('crm/users')
@Controller('crm/users')
export class UserController {
  private readonly connectionUtils = new ConnectionUtils();

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
  @ApiHeader({
    name: 'connection_token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getUsers(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.userService.getUsers(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getUser',
    summary: 'Retrieve a User',
    description: 'Retrieve a user from any connected Crm software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the user you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Crm software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getUser(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.userService.getUser(id, remote_data);
  }
}
