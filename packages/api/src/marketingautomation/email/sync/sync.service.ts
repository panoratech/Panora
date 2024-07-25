import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedMarketingautomationEmailOutput } from '../types/model.unified';
import { IEmailService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }
  saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: any[],
    originSource: string,
    remote_data: Record<string, any>[],
    ...rest: any
  ): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  async onModuleInit() {
    // Initialization logic
  }

  // Additional methods and logic
}
