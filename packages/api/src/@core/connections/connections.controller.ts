import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { CrmConnectionsService } from './crm/services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketingConnectionsService } from './ticketing/services/ticketing.connection.service';
import { ConnectorCategory } from '@panora/shared';
import { AccountingConnectionsService } from './accounting/services/accounting.connection.service';
import { MarketingAutomationConnectionsService } from './marketingautomation/services/marketingautomation.connection.service';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { CoreSyncService } from '@@core/sync/sync.service';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionUtils } from '@@core/connections/@utils';

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
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly crmConnectionsService: CrmConnectionsService,
    private readonly ticketingConnectionsService: TicketingConnectionsService,
    private readonly accountingConnectionsService: AccountingConnectionsService,
    private readonly marketingAutomationConnectionsService: MarketingAutomationConnectionsService,
    private readonly coreSyncService: CoreSyncService,
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
  async handleCallback(
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
      /*this.coreSyncService.initialSync(
        vertical.toLowerCase(),
        providerName,
        linkedUserId,
        projectId,
      );*/
      res.redirect(returnUrl);
    } catch (error) {
      handleServiceError(error, this.logger);
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
  @UseGuards(JwtAuthGuard)
  @Get()
  async getConnections(@Request() req: any) {
    const { id_project } = req.user;
    console.log('Req data is:', req.user);
    return await this.prisma.connections.findMany({
      where: {
        id_project: id_project,
      },
    });
  }

  @Post('create')
  async createConnection(@Body() data: {access_token: string; refresh_token: string}) {
    return await this.prisma.connections.create({
      data: {
        id_connection: uuidv4(),
        connection_token: uuidv4(),
        provider_slug: 'jira',
        vertical: 'ticketing',
        token_type: 'oauth',
        account_url: `https://api.atlassian.com/ex/jira/9739da36-e4a6-42c8-b642-aab0c784d2ef`,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiration_timestamp: new Date(
          new Date().getTime() + Number(3600) * 1000,
        ),
        status: 'valid',
        created_at: new Date(),
        projects: {
          connect: { id_project: "1e468c15-aa57-4448-aa2b-7fed640d1e3d" },
        },
        linked_users: {
          connect: {
            id_linked_user: await this.connectionUtils.getLinkedUserId(
              "1e468c15-aa57-4448-aa2b-7fed640d1e3d",
              "d44076f4-c1e6-4238-8940-a5e6fbc9f878",
            ),
          },
        },
      },
    });
  }
}
