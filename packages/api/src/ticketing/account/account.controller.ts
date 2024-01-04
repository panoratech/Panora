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
import { AccountService } from './services/account.service';

@ApiTags('ticketing/account')
@Controller('ticketing/account')
export class AccountController {
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(AccountResponse)
  @Get()
  getAccounts(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.accountService.getAccounts(
      integrationId,
      linkedUserId,
      remote_data,
    );
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
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(AccountResponse)
  @Get(':id')
  getAccount(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.accountService.getAccount(id, remote_data);
  }
}
