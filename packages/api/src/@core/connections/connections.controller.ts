import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CrmConnectionsService } from './crm/services/crm-connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ProviderVertical, getProviderVertical } from '@@core/utils/types';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(
    private readonly crmConnectionsService: CrmConnectionsService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(ConnectionsController.name);
  }

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

      const stateData = JSON.parse(decodeURIComponent(state));
      const { projectId, linkedUserId, providerName, returnUrl } = stateData;
      switch (getProviderVertical(providerName.toLowerCase())) {
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

  @ApiResponse({ status: 200 })
  @Get()
  async getConnections() {
    return await this.prisma.connections.findMany();
  }
}
