import { Injectable } from '@nestjs/common';
import { ITaxrateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITaxrateService>;

  constructor() {
    this.serviceMap = new Map<string, ITaxrateService>();
  }

  registerService(serviceKey: string, service: ITaxrateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITaxrateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/taxrate.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTaxrateInput, UnifiedTaxrateOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTaxrateOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ITaxrateService } from '../types';

@Injectable()
export class TaxrateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TaxrateService.name);
  }

  async batchAddTaxrates(
    unifiedTaxrateData: UnifiedTaxrateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxrateOutput[]> {
    return;
  }

  async addTaxrate(
    unifiedTaxrateData: UnifiedTaxrateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxrateOutput> {
        return;
  }

  async getTaxrate(
    id_taxrateing_taxrate: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxrateOutput> {
       return;

  }


  async getTaxrates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaxrateOutput[]> {
       return;

  }
}
