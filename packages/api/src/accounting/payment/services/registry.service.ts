import { Injectable } from '@nestjs/common';
import { IPaymentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPaymentService>;

  constructor() {
    this.serviceMap = new Map<string, IPaymentService>();
  }

  registerService(serviceKey: string, service: IPaymentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPaymentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/payment.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedPaymentInput, UnifiedPaymentOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPaymentOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IPaymentService } from '../types';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  async batchAddPayments(
    unifiedPaymentData: UnifiedPaymentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPaymentOutput[]> {
    return;
  }

  async addPayment(
    unifiedPaymentData: UnifiedPaymentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPaymentOutput> {
        return;
  }

  async getPayment(
    id_paymenting_payment: string,
    remote_data?: boolean,
  ): Promise<UnifiedPaymentOutput> {
       return;

  }


  async getPayments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPaymentOutput[]> {
       return;

  }
}
