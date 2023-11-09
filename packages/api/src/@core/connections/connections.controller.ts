import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConnectionsService } from './services/connections.service';
import { Response } from 'express'; // Importing the Express Response type for type checking

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('oauth/crm/callback')
  handleCRMCallback(
    @Res() res: Response,
    @Query('projectId') projectId: string,
    @Query('customerId') customerId: string,
    @Query('providerName') providerName: string,
    @Query('returnUrl') returnUrl: string,
    @Query('code') code: string,
    @Query('accountURL') zohoAccountURL?: string,
  ) {
    this.connectionsService.handleCRMCallBack(
      projectId,
      customerId,
      providerName,
      code,
      zohoAccountURL,
    );
    res.redirect(returnUrl);
  }
}
