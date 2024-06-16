import { Injectable } from '@nestjs/common';
import { IRejectreasonService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IRejectreasonService>;

  constructor() {
    this.serviceMap = new Map<string, IRejectreasonService>();
  }

  registerService(serviceKey: string, service: IRejectreasonService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IRejectreasonService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/rejectreason.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedRejectreasonInput, UnifiedRejectreasonOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalRejectreasonOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IRejectreasonService } from '../types';

@Injectable()
export class RejectreasonService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(RejectreasonService.name);
  }

  async batchAddRejectreasons(
    unifiedRejectreasonData: UnifiedRejectreasonInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectreasonOutput[]> {
    return;
  }

  async addRejectreason(
    unifiedRejectreasonData: UnifiedRejectreasonInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectreasonOutput> {
        return;
  }

  async getRejectreason(
    id_rejectreasoning_rejectreason: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectreasonOutput> {
       return;

  }


  async getRejectreasons(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectreasonOutput[]> {
       return;

  }
}
