import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedContactOutput } from '../types/model.unified';
import { IContactService } from '../types';
import { ContactServiceRegistry } from '../services/registry.service';

@Injectable()
export class SyncContactsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ContactServiceRegistry,
  ) {
    this.logger.setContext(SyncContactsService.name);
  }

  async onModuleInit() {
    // Initialization logic
  }
}
