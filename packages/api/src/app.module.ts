import { HttpException, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmModule } from './crm/crm.module';
import { AuthModule } from './@core/auth/auth.module';
import { AuthService } from './@core/auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { ConnectionsModule } from './@core/connections/connections.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './@core/tasks/tasks.service';
import { CrmConnectionModule } from './@core/connections/crm/crm-connection.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggerService } from './@core/logger/logger.service';
import { TicketingModule } from './ticketing/ticketing.module';
import { HrisModule } from './hris/hris.module';
import { MarketingAutomationModule } from './marketing-automation/marketing-automation.module';
import { AtsModule } from './ats/ats.module';
import { AccountingModule } from './accounting/accounting.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LinkedUsersModule } from './@core/linked-users/linked-users.module';
import { OrganisationsModule } from './@core/organisations/organisations.module';
import { ProjectsModule } from './@core/projects/projects.module';
import { FieldMappingModule } from './@core/field-mapping/field-mapping.module';

@Module({
  imports: [
    FieldMappingModule,
    LinkedUsersModule,
    OrganisationsModule,
    ProjectsModule,
    TicketingModule,
    HrisModule,
    MarketingAutomationModule,
    AtsModule,
    AccountingModule,
    FileStorageModule,
    CrmModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: 'dev',
      release: 'some_release',
      logLevels: ['debug'],
    }),
    ConnectionsModule,
    CrmConnectionModule,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
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
