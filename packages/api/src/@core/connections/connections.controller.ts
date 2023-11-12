import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express'; // Importing the Express Response type for type checking
import { CrmConnectionsService } from './crm/services/crm-connection.service';
import { ProviderVertical, getProviderVertical } from '../utils/providers';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly crmConnectionsService: CrmConnectionsService) {}

  @Get('oauth/callback')
  handleCallback(
    @Res() res: Response,
    @Query('projectId') projectId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('providerName') providerName: string,
    @Query('code') code: string,
    @Query('returnUrl') returnUrl: string,
    @Query('accountURL') zohoAccountURL?: string,
  ) {
    //TODO; ADD VERIFICATION OF PARAMS
    switch (getProviderVertical(providerName)) {
      case ProviderVertical.CRM:
        this.crmConnectionsService.handleCRMCallBack(
          projectId,
          linkedUserId,
          providerName,
          code,
          zohoAccountURL,
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
  }
}
