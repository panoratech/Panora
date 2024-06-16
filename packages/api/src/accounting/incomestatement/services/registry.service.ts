import { Injectable } from '@nestjs/common';
import { IIncomestatementService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IIncomestatementService>;

  constructor() {
    this.serviceMap = new Map<string, IIncomestatementService>();
  }

  registerService(serviceKey: string, service: IIncomestatementService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IIncomestatementService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/incomestatement.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedIncomestatementInput, UnifiedIncomestatementOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalIncomestatementOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IIncomestatementService } from '../types';

@Injectable()
export class IncomestatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(IncomestatementService.name);
  }

  async batchAddIncomestatements(
    unifiedIncomestatementData: UnifiedIncomestatementInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedIncomestatementOutput[]> {
    return;
  }

  async addIncomestatement(
    unifiedIncomestatementData: UnifiedIncomestatementInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedIncomestatementOutput> {
        return;
  }

  async getIncomestatement(
    id_incomestatementing_incomestatement: string,
    remote_data?: boolean,
  ): Promise<UnifiedIncomestatementOutput> {
       return;

  }


  async getIncomestatements(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedIncomestatementOutput[]> {
       return;

  }
}
