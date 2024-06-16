import { Injectable } from '@nestjs/common';
import { IActivityService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IActivityService>;

  constructor() {
    this.serviceMap = new Map<string, IActivityService>();
  }

  registerService(serviceKey: string, service: IActivityService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IActivityService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/activity.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedActivityInput, UnifiedActivityOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IActivityService } from '../types';

@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ActivityService.name);
  }

  async batchAddActivitys(
    unifiedActivityData: UnifiedActivityInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput[]> {
    return;
  }

  async addActivity(
    unifiedActivityData: UnifiedActivityInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput> {
        return;
  }

  async getActivity(
    id_activitying_activity: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput> {
       return;

  }


  async getActivitys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActivityOutput[]> {
       return;

  }
}
