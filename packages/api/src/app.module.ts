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
import { CrmConnectionModule } from './@core/connections/crm/crm-connection.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggerService } from './@core/logger/logger.service';
import { TicketingModule } from './ticketing/ticketing.module';
import { HrisModule } from './hris/hris.module';
import { MarketingAutomationModule } from './marketing-automation/marketing-automation.module';
import { AtsModule } from './ats/ats.module';
import { AccountingModule } from './accounting/accounting.module';
import { FileStorageModule } from './file-storage/file-storage.module';

@Module({
  imports: [
    TicketingModule,
    HrisModule,
    MarketingAutomationModule,
    AtsModule,
    AccountingModule,
    FileStorageModule,
    CrmModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
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
  providers: [AppService, AuthService, TasksService, LoggerService],
})
export class AppModule {}
