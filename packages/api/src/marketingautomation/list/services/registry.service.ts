import { Injectable } from '@nestjs/common';
import { IListService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IListService>;

  constructor() {
    this.serviceMap = new Map<string, IListService>();
  }

  registerService(serviceKey: string, service: IListService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IListService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/list.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedMarketingautomationError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedListInput, UnifiedListOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalListOutput } from '@@core/utils/types/original/original.marketingautomation';
import { unify } from '@@core/utils/unification/unify';
import { IListService } from '../types';

@Injectable()
export class ListService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ListService.name);
  }

  async batchAddLists(
    unifiedListData: UnifiedListInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedListOutput[]> {
    return;
  }

  async addList(
    unifiedListData: UnifiedListInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedListOutput> {
        return;
  }

  async getList(
    id_listing_list: string,
    remote_data?: boolean,
  ): Promise<UnifiedListOutput> {
       return;

  }


  async getLists(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedListOutput[]> {
       return;

  }
}
