import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';
import { AuthModule } from './@core/auth/auth.module';
import { AuthService } from './@core/auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { ConnectionsModule } from './@core/connections/connections.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './@core/tasks/tasks.service';
import { SentryModule } from './@core/sentry/sentry.module';
import { ConnectionsService } from './@core/connections/services/connections.service';
import { CrmConnectionsService } from './@core/connections/services/crm/crm-connection.service';

@Module({
  imports: [
    CrmModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ConnectionsModule,
    ScheduleModule.forRoot(),
    SentryModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    TasksService,
    ConnectionsService,
    CrmConnectionsService,
  ],
})
export class AppModule {}
