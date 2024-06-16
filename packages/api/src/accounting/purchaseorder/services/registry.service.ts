import { Injectable } from '@nestjs/common';
import { IPurchaseorderService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPurchaseorderService>;

  constructor() {
    this.serviceMap = new Map<string, IPurchaseorderService>();
  }

  registerService(serviceKey: string, service: IPurchaseorderService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPurchaseorderService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/purchaseorder.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedPurchaseorderInput, UnifiedPurchaseorderOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPurchaseorderOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IPurchaseorderService } from '../types';

@Injectable()
export class PurchaseorderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PurchaseorderService.name);
  }

  async batchAddPurchaseorders(
    unifiedPurchaseorderData: UnifiedPurchaseorderInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseorderOutput[]> {
    return;
  }

  async addPurchaseorder(
    unifiedPurchaseorderData: UnifiedPurchaseorderInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseorderOutput> {
        return;
  }

  async getPurchaseorder(
    id_purchaseordering_purchaseorder: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseorderOutput> {
       return;

  }


  async getPurchaseorders(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseorderOutput[]> {
       return;

  }
}
