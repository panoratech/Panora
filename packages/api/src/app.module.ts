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
import { CrmConnectionModule } from './@core/connections/crm/crm-connection.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggerService } from './@core/logger/logger.service';
import { HttpExceptionFilter } from './@core/filters/exception.filters';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    CrmModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ConnectionsModule,
    CrmConnectionModule,
    ScheduleModule.forRoot(),
    SentryModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, TasksService, LoggerService],
})
export class AppModule {}
