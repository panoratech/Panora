import { Injectable } from '@nestjs/common';
import { ICreditnoteService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICreditnoteService>;

  constructor() {
    this.serviceMap = new Map<string, ICreditnoteService>();
  }

  registerService(serviceKey: string, service: ICreditnoteService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICreditnoteService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/creditnote.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedCreditnoteInput, UnifiedCreditnoteOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCreditnoteOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ICreditnoteService } from '../types';

@Injectable()
export class CreditnoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CreditnoteService.name);
  }

  async batchAddCreditnotes(
    unifiedCreditnoteData: UnifiedCreditnoteInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCreditnoteOutput[]> {
    return;
  }

  async addCreditnote(
    unifiedCreditnoteData: UnifiedCreditnoteInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCreditnoteOutput> {
        return;
  }

  async getCreditnote(
    id_creditnoteing_creditnote: string,
    remote_data?: boolean,
  ): Promise<UnifiedCreditnoteOutput> {
       return;

  }


  async getCreditnotes(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCreditnoteOutput[]> {
       return;

  }
}
