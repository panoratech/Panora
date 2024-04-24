// tasks.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CrmConnectionsService } from '../connections/crm/services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private crmConnectionsService: CrmConnectionsService,
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
        await this.crmConnectionsService.handleCRMTokensRefresh(
          connection.id_connection,
          connection.provider_slug,
          connection.refresh_token,
          connection.id_project,
          account_url,
        );
      }
    }
  }
}
