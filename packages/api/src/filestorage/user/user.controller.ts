import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { UserService } from './services/user.service';
import { UnifiedUserInput, UnifiedUserOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('filestorage/permission')
@Controller('filestorage/permission')
export class UserController {
  constructor(
    private readonly permissionService: UserService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of Users',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async list(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.permissionService.getUsers(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a User',
    description:
      'Retrieve a permission from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the permission you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Filestorage software.',
  })
  @ApiCustomResponse(UnifiedUserOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.permissionService.getUser(id, remote_data);
  }
}
