import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingPurchaseorderInput,
  UnifiedAccountingPurchaseorderOutput,
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
    unifiedPurchaseOrderData: UnifiedAccountingPurchaseorderInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPurchaseorderOutput> {
    return;
  }

  async getPurchaseOrder(
    id_purchaseordering_purchaseorder: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPurchaseorderOutput> {
    return;
  }

  async getPurchaseOrders(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedAccountingPurchaseorderOutput[]> {
    return;
  }
}
