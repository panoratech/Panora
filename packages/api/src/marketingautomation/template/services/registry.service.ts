import { Injectable } from '@nestjs/common';
import { ITemplateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITemplateService>;

  constructor() {
    this.serviceMap = new Map<string, ITemplateService>();
  }

  registerService(serviceKey: string, service: ITemplateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITemplateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/template.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedMarketingautomationError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTemplateInput, UnifiedTemplateOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTemplateOutput } from '@@core/utils/types/original/original.marketingautomation';
import { unify } from '@@core/utils/unification/unify';
import { ITemplateService } from '../types';

@Injectable()
export class TemplateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TemplateService.name);
  }

  async batchAddTemplates(
    unifiedTemplateData: UnifiedTemplateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput[]> {
    return;
  }

  async addTemplate(
    unifiedTemplateData: UnifiedTemplateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput> {
        return;
  }

  async getTemplate(
    id_templateing_template: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput> {
       return;

  }


  async getTemplates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTemplateOutput[]> {
       return;

  }
}
