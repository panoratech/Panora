import { HttpException, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './@core/tasks/tasks.service';
import { LoggerModule } from 'nestjs-pino';
import { HrisModule } from './hris/hris.module';
import { MarketingAutomationModule } from './marketing-automation/marketing-automation.module';
import { AtsModule } from './ats/ats.module';
import { AccountingModule } from './accounting/accounting.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from '@@core/logger/logger.service';
import { CoreModule } from '@@core/core.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    CoreModule,
    HrisModule,
    MarketingAutomationModule,
    AtsModule,
    AccountingModule,
    FileStorageModule,
    CrmModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: 'dev',
      release: 'some_release',
      logLevels: ['debug'],
    }),
    ScheduleModule.forRoot(),
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
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TasksService,
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) => 500 > exception.getStatus(), // Only report 500 errors
            },
          ],
        }),
    },
  ],
})
export class AppModule {}
