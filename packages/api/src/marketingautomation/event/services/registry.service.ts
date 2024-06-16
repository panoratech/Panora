import { Injectable } from '@nestjs/common';
import { IEventService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEventService>;

  constructor() {
    this.serviceMap = new Map<string, IEventService>();
  }

  registerService(serviceKey: string, service: IEventService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEventService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/event.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedMarketingautomationError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedEventInput, UnifiedEventOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEventOutput } from '@@core/utils/types/original/original.marketingautomation';
import { unify } from '@@core/utils/unification/unify';
import { IEventService } from '../types';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EventService.name);
  }

  async batchAddEvents(
    unifiedEventData: UnifiedEventInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput[]> {
    return;
  }

  async addEvent(
    unifiedEventData: UnifiedEventInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput> {
        return;
  }

  async getEvent(
    id_eventing_event: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput> {
       return;

  }


  async getEvents(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEventOutput[]> {
       return;

  }
}
