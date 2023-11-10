import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express'; // Importing the Express Response type for type checking
import { CrmConnectionsService } from './services/crm-connection.service';

@Controller('connections/crm')
export class CrmConnectionsController {
  constructor(private readonly crmConnectionsService: CrmConnectionsService) {}

  @Get('oauth/callback')
  handleCRMCallback(
    @Res() res: Response,
    @Query('projectId') projectId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('providerName') providerName: string,
    @Query('returnUrl') returnUrl: string,
    @Query('code') code: string,
    @Query('accountURL') zohoAccountURL?: string,
  ) {
    //TODO; ADD VERIFICATION OF PARAMS

    this.crmConnectionsService.handleCRMCallBack(
      projectId,
      linkedUserId,
      providerName,
      code,
      zohoAccountURL,
    );
    res.redirect(returnUrl);
  }
}
