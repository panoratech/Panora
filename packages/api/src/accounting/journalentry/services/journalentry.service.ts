import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedJournalEntryInput,
  UnifiedJournalEntryOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalJournalEntryOutput } from '@@core/utils/types/original/original.accounting';

import { IJournalEntryService } from '../types';

@Injectable()
export class JournalEntryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JournalEntryService.name);
  }

  async addJournalEntry(
    unifiedJournalEntryData: UnifiedJournalEntryInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput> {
    return;
  }

  async getJournalEntry(
    id_journalentrying_journalentry: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalEntryOutput> {
    return;
  }

  async getJournalEntrys(
    connectionId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedJournalEntryOutput[]> {
    return;
  }
}
