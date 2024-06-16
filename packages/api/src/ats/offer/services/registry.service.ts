import { Injectable } from '@nestjs/common';
import { IOfferService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IOfferService>;

  constructor() {
    this.serviceMap = new Map<string, IOfferService>();
  }

  registerService(serviceKey: string, service: IOfferService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IOfferService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/offer.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedOfferInput, UnifiedOfferOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IOfferService } from '../types';

@Injectable()
export class OfferService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(OfferService.name);
  }

  async batchAddOffers(
    unifiedOfferData: UnifiedOfferInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput[]> {
    return;
  }

  async addOffer(
    unifiedOfferData: UnifiedOfferInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput> {
        return;
  }

  async getOffer(
    id_offering_offer: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput> {
       return;

  }


  async getOffers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput[]> {
       return;

  }
}
