import { Controller, Get, Query } from '@nestjs/common';
import { ConnectionsService } from './services/connections.service';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('oauth/crm/callback')
  handleCRMCallback(
    @Query('projectId') projectId: string,
    @Query('customerId') customerId: string,
    @Query('providerName') providerName: string,
    @Query('returnUrl') returnUrl: string,
    @Query('code') code: string,
    @Query('accountURL') zohoAccountURL?: string,
  ) {
    return this.connectionsService.handleCRMCallBack(
      projectId,
      customerId,
      providerName,
      returnUrl,
      code,
      zohoAccountURL,
    );
  }
}
