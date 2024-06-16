import { Injectable } from '@nestjs/common';
import { ITrackingcategoryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITrackingcategoryService>;

  constructor() {
    this.serviceMap = new Map<string, ITrackingcategoryService>();
  }

  registerService(serviceKey: string, service: ITrackingcategoryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITrackingcategoryService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/trackingcategory.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTrackingcategoryInput, UnifiedTrackingcategoryOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTrackingcategoryOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ITrackingcategoryService } from '../types';

@Injectable()
export class TrackingcategoryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TrackingcategoryService.name);
  }

  async batchAddTrackingcategorys(
    unifiedTrackingcategoryData: UnifiedTrackingcategoryInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingcategoryOutput[]> {
    return;
  }

  async addTrackingcategory(
    unifiedTrackingcategoryData: UnifiedTrackingcategoryInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingcategoryOutput> {
        return;
  }

  async getTrackingcategory(
    id_trackingcategorying_trackingcategory: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingcategoryOutput> {
       return;

  }


  async getTrackingcategorys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingcategoryOutput[]> {
       return;

  }
}
