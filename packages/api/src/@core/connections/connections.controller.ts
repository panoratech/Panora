import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CrmConnectionsService } from './crm/services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketingConnectionsService } from './ticketing/services/ticketing.connection.service';
import { ProviderVertical } from '@panora/shared';
import { AccountingConnectionsService } from './accounting/services/accounting.connection.service';
import { MarketingAutomationConnectionsService } from './marketingautomation/services/marketingautomation.connection.service';

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
  handleCallback(
    @Res() res: Response,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('location') zohoLocation?: string,
  ) {
    try {
      if (!state)
        throw new NotFoundError(
          `No Callback Params found for state, found ${state}`,
        );
      if (!code)
        throw new NotFoundError(
          `No Callback Params found for code, found ${code}`,
        );

      const stateData: StateDataType = JSON.parse(decodeURIComponent(state));
      const { projectId, vertical, linkedUserId, providerName, returnUrl } =
        stateData;
      switch (vertical.toLowerCase()) {
        case ProviderVertical.CRM:
          const zohoLocation_ = zohoLocation ? zohoLocation : '';
          this.crmConnectionsService.handleCRMCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
            zohoLocation_,
          );
          break;
        case ProviderVertical.ATS:
          break;
        case ProviderVertical.Accounting:
          this.accountingConnectionsService.handleAccountingCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
        case ProviderVertical.FileStorage:
          break;
        case ProviderVertical.HRIS:
          break;
        case ProviderVertical.MarketingAutomation:
          this.marketingAutomationConnectionsService.handleMarketingAutomationCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
        case ProviderVertical.Ticketing:
          this.ticketingConnectionsService.handleTicketingCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
          );
          break;
        case ProviderVertical.Unknown:
          break;
      }
      res.redirect(returnUrl);
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Get('gorgias/oauth/install')
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
      if (!account) throw new Error('account prop not found');
      const params = `?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&state=${state}&nonce=${nonce}&scope=${scope}`;
      res.redirect(`https://${account}.gorgias.com/oauth/authorize${params}`);
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @ApiOperation({
    operationId: 'getConnections',
    summary: 'List Connections',
  })
  @ApiResponse({ status: 200 })
  @Get()
  async getConnections() {
    return await this.prisma.connections.findMany();
  }
}
