import { Injectable } from '@nestjs/common';
import { ICashflowstatementService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICashflowstatementService>;

  constructor() {
    this.serviceMap = new Map<string, ICashflowstatementService>();
  }

  registerService(serviceKey: string, service: ICashflowstatementService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICashflowstatementService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/cashflowstatement.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedCashflowstatementInput, UnifiedCashflowstatementOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCashflowstatementOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ICashflowstatementService } from '../types';

@Injectable()
export class CashflowstatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CashflowstatementService.name);
  }

  async batchAddCashflowstatements(
    unifiedCashflowstatementData: UnifiedCashflowstatementInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowstatementOutput[]> {
    return;
  }

  async addCashflowstatement(
    unifiedCashflowstatementData: UnifiedCashflowstatementInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowstatementOutput> {
        return;
  }

  async getCashflowstatement(
    id_cashflowstatementing_cashflowstatement: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowstatementOutput> {
       return;

  }


  async getCashflowstatements(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCashflowstatementOutput[]> {
       return;

  }
}
