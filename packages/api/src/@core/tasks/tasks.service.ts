// tasks.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionsService } from '../connections/services/connections.service';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private connectionsService: ConnectionsService,
  ) {}

  onModuleInit() {
    this.handleCron();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // refresh all tokens that expire in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const connectionsToRefresh = await this.prisma.connections.findMany({
      where: {
        expiration_timestamp: {
          lte: threeDaysFromNow,
        },
      },
    });

    for (const connection of connectionsToRefresh) {
      if (connection.refresh_token) {
        const account_url =
          connection.provider_slug == 'zoho' ? connection.account_url : '';
        await this.connectionsService.handleCRMTokensRefresh(
          connection.id_connection,
          connection.provider_slug,
          connection.refresh_token,
          account_url,
        );
      }
    }
  }
}
