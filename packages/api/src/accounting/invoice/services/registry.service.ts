import { Injectable } from '@nestjs/common';
import { IInvoiceService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IInvoiceService>;

  constructor() {
    this.serviceMap = new Map<string, IInvoiceService>();
  }

  registerService(serviceKey: string, service: IInvoiceService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IInvoiceService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/invoice.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedInvoiceInput, UnifiedInvoiceOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalInvoiceOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IInvoiceService } from '../types';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(InvoiceService.name);
  }

  async batchAddInvoices(
    unifiedInvoiceData: UnifiedInvoiceInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput[]> {
    return;
  }

  async addInvoice(
    unifiedInvoiceData: UnifiedInvoiceInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput> {
        return;
  }

  async getInvoice(
    id_invoiceing_invoice: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput> {
       return;

  }


  async getInvoices(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInvoiceOutput[]> {
       return;

  }
}
