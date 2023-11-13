import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express'; // Importing the Express Response type for type checking
import { CrmConnectionsService } from './crm/services/crm-connection.service';
import { ProviderVertical, getProviderVertical } from '../utils/providers';
import { LoggerService } from '../logger/logger.service';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly crmConnectionsService: CrmConnectionsService) {}
  @Get('oauth/callback')
  handleCallback(
    @Res() res: Response,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('location') zohoLocation?: string,
  ) {
    try {
      if (!state || !code) throw new Error('no params found');
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
      console.error('An error occurred', error.response?.data || error.message);
    }
  }
}
