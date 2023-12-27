import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { handleServiceError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ZendeskService } from '../services/zendesk';

@Injectable()
export class SyncTicketsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private zendesk: ZendeskService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(SyncTicketsService.name);
  }

  async onModuleInit() {
    try {
      await this.syncTickets();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  async syncTickets() {
    try {
      this.logger.log(`Syncing tickets....`);
      //TODO
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
