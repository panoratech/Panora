import { CoreModule } from '@@core/core.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TicketingModule } from '@ticketing/ticketing.module';
import { LoggerModule } from 'nestjs-pino';
import { AccountingModule } from './accounting/accounting.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AtsModule } from './ats/ats.module';
import { CrmModule } from './crm/crm.module';
import { FileStorageModule } from './filestorage/filestorage.module';
import { HrisModule } from './hris/hris.module';
import { MarketingAutomationModule } from './marketingautomation/marketingautomation.module';
import { CoreSharedModule } from '@@core/@core-services/module';
import { EcommerceModule } from '@ecommerce/ecommerce.module';

@Module({
  imports: [
    CoreSharedModule,
    CoreModule,
    HrisModule,
    MarketingAutomationModule,
    AtsModule,
    AccountingModule,
    FileStorageModule,
    EcommerceModule,
    CrmModule,
    TicketingModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    /*...(process.env.DISTRIBUTION === 'managed'
      ? [
          SentryModule.forRoot({
            dsn: process.env.SENTRY_DSN,
            debug: true,
            environment: `${process.env.ENV}-${process.env.DISTRIBUTION}`,
            release: `${process.env.DISTRIBUTION}`,
            logLevels: ['debug'],
          }),
        ]
      : []),*/
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
          env: process.env.ENV,
          distribution: process.env.DISTRIBUTION,
          commit_id: process.env.GIT_COMMIT_ID,
        }),
        transport:
          process.env.AXIOM_AGENT_STATUS === 'ENABLED'
            ? {
                target: '@axiomhq/pino',
                options: {
                  dataset: process.env.AXIOM_DATASET,
                  token: process.env.AXIOM_TOKEN,
                },
              }
            : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              },
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASS,
        username: process.env.REDIS_USER || 'default',
        db: Number(process.env.REDIS_DB) || 0,
        //enableReadyCheck: false,
        //maxRetriesPerRequest: null,
        tls: process.env.REDIS_TLS ? { rejectUnauthorized: false } : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    /*{
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
    },*/
  ],
})
export class AppModule {}
