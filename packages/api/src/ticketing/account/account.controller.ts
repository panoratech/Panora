import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { AccountService } from './services/account.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedAccountOutput } from './types/model.unified';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/accounts')
@Controller('ticketing/accounts')
export class AccountController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly accountService: AccountService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @ApiOperation({
    operationId: 'getAccounts',
    summary: 'List a batch of Accounts',
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
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedAccountOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getAccounts(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.accountService.getAccounts(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getAccount',
    summary: 'Retrieve an Account',
    description: 'Retrieve an account from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the account you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedAccountOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getAccount(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.accountService.getAccount(id, remote_data);
  }
}
