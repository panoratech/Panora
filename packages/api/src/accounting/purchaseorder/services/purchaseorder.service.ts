import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedPurchaseOrderInput,
  UnifiedPurchaseOrderOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPurchaseOrderOutput } from '@@core/utils/types/original/original.accounting';

import { IPurchaseOrderService } from '../types';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PurchaseOrderService.name);
  }

  async addPurchaseOrder(
    unifiedPurchaseOrderData: UnifiedPurchaseOrderInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseOrderOutput> {
    return;
  }

  async getPurchaseOrder(
    id_purchaseordering_purchaseorder: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPurchaseOrderOutput> {
    return;
  }

  async getPurchaseOrders(
    connectionId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedPurchaseOrderOutput[]> {
    return;
  }
}
