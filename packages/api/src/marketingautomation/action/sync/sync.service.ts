import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServiceRegistry } from '../services/registry.service';

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
