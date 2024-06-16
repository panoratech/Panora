import { Injectable } from '@nestjs/common';
import { IJournalentryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJournalentryService>;

  constructor() {
    this.serviceMap = new Map<string, IJournalentryService>();
  }

  registerService(serviceKey: string, service: IJournalentryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJournalentryService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/journalentry.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedJournalentryInput, UnifiedJournalentryOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalJournalentryOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IJournalentryService } from '../types';

@Injectable()
export class JournalentryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JournalentryService.name);
  }

  async batchAddJournalentrys(
    unifiedJournalentryData: UnifiedJournalentryInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalentryOutput[]> {
    return;
  }

  async addJournalentry(
    unifiedJournalentryData: UnifiedJournalentryInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalentryOutput> {
        return;
  }

  async getJournalentry(
    id_journalentrying_journalentry: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalentryOutput> {
       return;

  }


  async getJournalentrys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJournalentryOutput[]> {
       return;

  }
}
