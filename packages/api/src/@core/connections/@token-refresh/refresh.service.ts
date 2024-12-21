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

  // This will run every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    const now = new Date();

    // refresh tokens that expire in less than 48 hours from now
    // Keep the time window wide to be able to react to incidents
    const timeWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const connectionsToRefresh = await this.prisma.connections.findMany({
      where: {
        expiration_timestamp: {
          lte: timeWindow.toISOString(),
        },
      },
    });

    for (const connection of connectionsToRefresh) {
      try {
        if (connection.refresh_token) {
          const account_url =
            connection.provider_slug === 'zoho' ? connection.account_url : '';

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
        this.logger.error(
          `Failed to refresh token for connection: ${connection.id_connection} ${connection.provider_slug}`,
          error,
        );
      }
    }
  }
}
