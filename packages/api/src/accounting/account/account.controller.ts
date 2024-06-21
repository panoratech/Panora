import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
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
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { AccountService } from './services/account.service';

@ApiTags('accounting/account')
@Controller('accounting/account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @ApiOperation({
    operationId: 'getAccountingAccounts',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedAccountOutput)
  //@UseGuards(ApiKeyAuthGuard)
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
    operationId: 'getAccountingAccount',
    summary: 'Retrieve a Account',
    description: 'Retrieve a account from any connected Accounting software',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiCustomResponse(UnifiedAccountOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getAccount(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.accountService.getAccount(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addAccount',
    summary: 'Create a Account',
    description: 'Create a account in any supported Accounting software',
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
      'Set to true to include data from the original Accounting software.',
  })
  @ApiBody({ type: UnifiedAccountInput })
  @ApiCustomResponse(UnifiedAccountOutput)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async addAccount(
    @Body() unifiedAccountData: UnifiedAccountInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.accountService.addAccount(
        unifiedAccountData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
