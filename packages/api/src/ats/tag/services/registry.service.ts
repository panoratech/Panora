import { Injectable } from '@nestjs/common';
import { ITagService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITagService>;

  constructor() {
    this.serviceMap = new Map<string, ITagService>();
  }

  registerService(serviceKey: string, service: ITagService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITagService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/tag.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTagInput, UnifiedTagOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { ITagService } from '../types';

@Injectable()
export class TagService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TagService.name);
  }

  async batchAddTags(
    unifiedTagData: UnifiedTagInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput[]> {
    return;
  }

  async addTag(
    unifiedTagData: UnifiedTagInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
        return;
  }

  async getTag(
    id_taging_tag: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
       return;

  }


  async getTags(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput[]> {
       return;

  }
}
