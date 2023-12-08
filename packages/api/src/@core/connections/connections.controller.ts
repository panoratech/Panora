import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CrmConnectionsService } from './crm/services/crm-connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ProviderVertical, getProviderVertical } from '@@core/utils/types';
@Controller('connections')
export class ConnectionsController {
  constructor(
    private readonly crmConnectionsService: CrmConnectionsService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(ConnectionsController.name);
  }

  @Get('oauth/callback')
  handleCallback(
    @Res() res: Response,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('location') zohoLocation?: string,
  ) {
    try {
      if (!state) throw new Error('No Callback Params found for state');
      if (!code) throw new Error('No Callback Params found for code');

      const stateData = JSON.parse(decodeURIComponent(state));
      const { projectId, linkedUserId, providerName, returnUrl } = stateData;
      //TODO; ADD VERIFICATION OF PARAMS
      switch (getProviderVertical(providerName)) {
        case ProviderVertical.CRM:
          const zohoLocation_ = zohoLocation ? zohoLocation : '';
          this.crmConnectionsService.handleCRMCallBack(
            projectId,
            linkedUserId,
            providerName,
            code,
            zohoLocation_,
          );
        case ProviderVertical.ATS:
          break;
        case ProviderVertical.Accounting:
          break;
        case ProviderVertical.FileStorage:
          break;
        case ProviderVertical.HRIS:
          break;
        case ProviderVertical.MarketingAutomation:
          break;
        case ProviderVertical.Ticketing:
          break;
        case ProviderVertical.Unknown:
          break;
      }

      res.redirect(returnUrl);
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Get()
  async getConnections() {
    return await this.prisma.connections.findMany();
  }
}
