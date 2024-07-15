// tasks.service.ts
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../@core-services/prisma/prisma.service';

@Injectable()
export class OAuthTokenRefreshService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private categoryConnectionRegistry: CategoryConnectionRegistry,
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
      try {
        if (connection.refresh_token) {
          const account_url =
            connection.provider_slug == 'zoho' ? connection.account_url : '';
          await this.categoryConnectionRegistry
            .getService(connection.vertical.toLowerCase())
            .handleTokensRefresh(
              connection.id_connection,
              connection.provider_slug,
              connection.refresh_token,
              connection.id_project,
              account_url,
            );
        }
      } catch (error) {
        this.logger.error('failed to refresh token ', error);
      }
    }
  }
}
