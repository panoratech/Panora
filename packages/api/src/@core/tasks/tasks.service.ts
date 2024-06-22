// tasks.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CrmConnectionsService } from '../connections/crm/services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ConnectorCategory } from '@panora/shared';
import { AccountingConnectionsService } from '@@core/connections/accounting/services/accounting.connection.service';
import { MarketingAutomationConnectionsService } from '@@core/connections/marketingautomation/services/marketingautomation.connection.service';
import { TicketingConnectionsService } from '@@core/connections/ticketing/services/ticketing.connection.service';
import { AtsConnectionsService } from '@@core/connections/ats/services/ats.connection.service';
import { HrisConnectionsService } from '@@core/connections/hris/services/hris.connection.service';
import { FilestorageConnectionsService } from '@@core/connections/filestorage/services/filestorage.connection.service';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private readonly crmConnectionsService: CrmConnectionsService,
    private readonly ticketingConnectionsService: TicketingConnectionsService,
    private readonly accountingConnectionsService: AccountingConnectionsService,
    private readonly marketingAutomationConnectionsService: MarketingAutomationConnectionsService,
    private readonly atsConnectionsService: AtsConnectionsService,
    private readonly hrisConnectionsService: HrisConnectionsService,
    private readonly fileStorageConnectionsService: FilestorageConnectionsService,
    private logger: LoggerService,
  ) {}

  onModuleInit() {
    this.handleCron();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // refresh all tokens that expire in less than 10 hours
    const tenHoursFromNow = new Date();
    tenHoursFromNow.setHours(tenHoursFromNow.getHours() + 10);
    const connectionsToRefresh = await this.prisma.connections.findMany({
      where: {
        expiration_timestamp: {
          lte: tenHoursFromNow,
        },
      },
    });

    for (const connection of connectionsToRefresh) {
      if (connection.refresh_token) {
        const account_url =
          connection.provider_slug == 'zoho' ? connection.account_url : '';

        switch (connection.vertical) {
          case ConnectorCategory.Crm:
            await this.crmConnectionsService.handleCrmTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.Ats:
            this.atsConnectionsService.handleAtsTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.Accounting:
            this.accountingConnectionsService.handleAccountingTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.FileStorage:
            this.fileStorageConnectionsService.handleFilestorageTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.Hris:
            this.hrisConnectionsService.handleHrisTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.MarketingAutomation:
            this.marketingAutomationConnectionsService.handleMarketingAutomationTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;

          case ConnectorCategory.Ticketing:
            this.ticketingConnectionsService.handleTicketingTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
            break;
        }
      }
    }
  }
}
