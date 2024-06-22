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
import { ConnectionsError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketingConnectionsService } from './ticketing/services/ticketing.connection.service';
import { ConnectorCategory, CONNECTORS_METADATA } from '@panora/shared';
import { AccountingConnectionsService } from './accounting/services/accounting.connection.service';
import { MarketingAutomationConnectionsService } from './marketingautomation/services/marketingautomation.connection.service';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { CoreSyncService } from '@@core/sync/sync.service';
import { HrisConnectionsService } from './hris/services/hris.connection.service';
import { FilestorageConnectionsService } from './filestorage/services/filestorage.connection.service';
import { AtsConnectionsService } from './ats/services/ats.connection.service';
import { ManagementConnectionsService } from './management/services/management.connection.service';

export type StateDataType = {
  projectId: string;
  vertical: string;
  linkedUserId: string;
  providerName: string;
  returnUrl?: string;
};

export class BodyDataType {
  apikey: string;
  [key: string]: any;
}

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(
    private readonly crmConnectionsService: CrmConnectionsService,
    private readonly ticketingConnectionsService: TicketingConnectionsService,
    private readonly accountingConnectionsService: AccountingConnectionsService,
    private readonly marketingautomationConnectionsService: MarketingAutomationConnectionsService,
    private readonly filestorageConnectionsService: FilestorageConnectionsService,
    private readonly hrisConnectionsService: HrisConnectionsService,
    private readonly atsConnectionsService: AtsConnectionsService,
    private readonly managementConnectionsService: ManagementConnectionsService,
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
  @ApiResponse({ status: 200 })
  @Get('oauth/callback')
  async handleOAuthCallback(@Res() res: Response, @Query() query: any) {
    try {
      const { state, code } = query;
      if (!code) {
        throw new ConnectionsError({
          name: 'OAUTH_CALLBACK_CODE_NOT_FOUND_ERROR',
          message: `No Callback Params found for code, found ${code}`,
        });
      }

      if (!state) {
        throw new ConnectionsError({
          name: 'OAUTH_CALLBACK_STATE_NOT_FOUND_ERROR',
          message: `No Callback Params found for state, found ${state}`,
        });
      }

      const stateData: StateDataType = JSON.parse(decodeURIComponent(state));
      const { projectId, vertical, linkedUserId, providerName, returnUrl } =
        stateData;

      switch (vertical.toLowerCase()) {
        case ConnectorCategory.Crm:
          const { location } = query;
          await this.crmConnectionsService.handleCrmCallBack(
            providerName,
            { linkedUserId, projectId, code, location },
            'oauth',
          );
          break;
        case ConnectorCategory.Ats:
          await this.atsConnectionsService.handleAtsCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.Accounting:
          await this.accountingConnectionsService.handleAccountingCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.FileStorage:
          await this.filestorageConnectionsService.handleFilestorageCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.Hris:
          await this.hrisConnectionsService.handleHrisCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.MarketingAutomation:
          await this.marketingautomationConnectionsService.handleMarketingAutomationCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.Ticketing:
          await this.ticketingConnectionsService.handleTicketingCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
        case ConnectorCategory.Management:
          await this.managementConnectionsService.handleManagementCallBack(
            providerName,
            { linkedUserId, projectId, code },
            'oauth',
          );
          break;
      }

      res.redirect(returnUrl);

      if (
        CONNECTORS_METADATA[vertical.toLowerCase()][providerName.toLowerCase()]
          .active !== false
      ) {
        this.logger.log('triggering initial core sync for all objects...;');
        // Performing Core Sync Service for active connectors
        await this.coreSync.initialSync(
          vertical.toLowerCase(),
          providerName,
          linkedUserId,
          projectId,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /*@Get('/gorgias/oauth/install')
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
      console.log(client_id)
      if (!account) throw new ReferenceError('account prop not found');
      const params = `?client_id=${client_id}&response_type=${response_type}&redirect_uri=${redirect_uri}&state=${state}&nonce=${nonce}&scope=${scope}`;
      res.redirect(`https://${account}.gorgias.com/oauth/authorize${params}`);
    } catch (error) {
      throw error;
    }
  }*/

  @ApiOperation({
    operationId: 'handleApiKeyCallback',
    summary: 'Capture api key callback',
  })
  @ApiQuery({ name: 'state', required: true, type: String })
  @ApiBody({ type: BodyDataType })
  //@UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201 })
  @Post('apikey/callback')
  async handleApiKeyCallback(
    @Res() res: Response,
    @Query() query: any,
    @Body() body: BodyDataType,
  ) {
    try {
      const { state } = query;
      if (!state) {
        throw ReferenceError('State not found');
      }
      const stateData: StateDataType = JSON.parse(decodeURIComponent(state));
      const { projectId, vertical, linkedUserId, providerName, returnUrl } =
        stateData;
      const { apikey, ...body_data } = body;
      switch (vertical.toLowerCase()) {
        case ConnectorCategory.Crm:
          await this.crmConnectionsService.handleCrmCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.Ats:
          await this.atsConnectionsService.handleAtsCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.Accounting:
          await this.accountingConnectionsService.handleAccountingCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.FileStorage:
          await this.filestorageConnectionsService.handleFilestorageCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.Hris:
          await this.hrisConnectionsService.handleHrisCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.MarketingAutomation:
          await this.marketingautomationConnectionsService.handleMarketingAutomationCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
        case ConnectorCategory.Ticketing:
          await this.ticketingConnectionsService.handleTicketingCallBack(
            providerName,
            {
              projectId,
              linkedUserId,
              apikey,
              body_data,
            },
            'apikey',
          );
          break;
      }

      res.redirect(returnUrl);

      if (
        CONNECTORS_METADATA[vertical.toLowerCase()][providerName.toLowerCase()]
          .active !== false
      ) {
        this.logger.log('triggering initial core sync for all objects...;');
        // Performing Core Sync Service for active connectors
        await this.coreSync.initialSync(
          vertical.toLowerCase(),
          providerName,
          linkedUserId,
          projectId,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    operationId: 'getConnections',
    summary: 'List Connections',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req: any) {
    try {
      const { id_project } = req.user;
      console.log('Req data is:', req.user);
      return await this.prisma.connections.findMany({
        where: {
          id_project: id_project,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
