import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { AccountService } from './services/account.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedAccountOutput } from './types/model.unified';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiBearerAuth('JWT')
@ApiTags('ticketing/accounts')
@Controller('ticketing/accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @ApiOperation({
    operationId: 'getTicketingAccounts',
    summary: 'List a batch of Accounts',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedAccountOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getAccounts(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.accountService.getAccounts(
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTicketingAccount',
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
