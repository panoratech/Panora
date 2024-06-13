import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { CrmConnectionsService } from './crm/services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ConnectionsError, throwTypedError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketingConnectionsService } from './ticketing/services/ticketing.connection.service';
import { ConnectorCategory } from '@panora/shared';
import { AccountingConnectionsService } from './accounting/services/accounting.connection.service';
import { MarketingAutomationConnectionsService } from './marketingautomation/services/marketingautomation.connection.service';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { CoreSyncService } from '@@core/sync/sync.service';

export type StateDataType = {
  projectId: string;
  vertical: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
};

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(
    private readonly crmConnectionsService: CrmConnectionsService,
    private readonly ticketingConnectionsService: TicketingConnectionsService,
    private readonly accountingConnectionsService: AccountingConnectionsService,
    private readonly marketingAutomationConnectionsService: MarketingAutomationConnectionsService,
    private logger: LoggerService,
    private prisma: PrismaService,
    private coreSync: CoreSyncService,
  ) {
    this.logger.setContext(ConnectionsController.name);
  }

  @ApiOperation({
    operationId: 'handleOAuthCallback',
    summary: 'Capture oAuth callback',
  })
  @ApiQuery({ name: 'state', required: true, type: String })
  @ApiQuery({ name: 'code', required: true, type: String })
  @ApiQuery({ name: 'location', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get('oauth/callback')
  async handleCallback(
    @Res() res: Response,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('location') zohoLocation?: string,
  ) {
    try {
      if (!state)
        new ConnectionsError({
          name: 'OAUTH_CALLBACK_STATE_NOT_FOUND_ERROR',
          message: `No Callback Params found for state, found ${state}`,
        });
      if (!code)
        new ConnectionsError({
          name: 'OAUTH_CALLBACK_CODE_NOT_FOUND_ERROR',
          message: `No Callback Params found for code, found ${code}`,
        });

      const stateData: StateDataType = JSON.parse(decodeURIComponent(state));
      const { projectId, vertical, linkedUserId, providerName, returnUrl } =
        stateData;
      switch (vertical.toLowerCase()) {
        case ConnectorCategory.Crm:
          const zohoLocation_ = zohoLocation ? zohoLocation : '';
          await this.crmConnectionsService.handleCRMCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
            zohoLocation_,
          );
          break;
        case ConnectorCategory.Ats:
          break;
        case ConnectorCategory.Accounting:
          await this.accountingConnectionsService.handleAccountingCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
        case ConnectorCategory.FileStorage:
          break;
        case ConnectorCategory.Hris:
          break;
        case ConnectorCategory.MarketingAutomation:
          await this.marketingAutomationConnectionsService.handleMarketingAutomationCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
        case ConnectorCategory.Ticketing:
          await this.ticketingConnectionsService.handleTicketingCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
      }
      // Performing Core Sync Service
      this.coreSync.initialSync(
        vertical.toLowerCase(),
        providerName,
        linkedUserId,
        projectId,
      );
      res.redirect(returnUrl);
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'OAUTH_CALLBACK_ERROR',
          message: 'ConnectionsController.handleCallback() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  @Get('/gorgias/oauth/install')
  handleGorgiasAuthUrl(
    @Res() res: Response,
    @Query('account') account: string,
    @Query('response_type') response_type: string,
    @Query('nonce') nonce: string,
    @Query('scope') scope: string,
    @Query('client_id') client_id: string,
    @Query('redirect_uri') redirect_uri: string,
    @Query('state') state: string,
  ) {
    try {
      if (!account) throw new ReferenceError('account prop not found');
      const params = `?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&state=${state}&nonce=${nonce}&scope=${scope}`;
      res.redirect(`https://${account}.gorgias.com/oauth/authorize${params}`);
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'OAUTH_CALLBACK_ERROR',
          message: 'ConnectionsController.handleGorgiasAuthUrl() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  @ApiOperation({
    operationId: 'getConnections',
    summary: 'List Connections',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getConnections(@Request() req: any) {
    try {
      const { id_project } = req.user;
      console.log('Req data is:', req.user);
      return await this.prisma.connections.findMany({
        where: {
          id_project: id_project,
        },
      });
    } catch (error) {
      throwTypedError(
        new ConnectionsError({
          name: 'GET_CONNECTIONS_ERROR',
          message: 'ConnectionsController.getConnections() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
