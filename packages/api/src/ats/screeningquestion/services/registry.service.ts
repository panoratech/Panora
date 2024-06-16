import { Injectable } from '@nestjs/common';
import { IScreeningquestionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IScreeningquestionService>;

  constructor() {
    this.serviceMap = new Map<string, IScreeningquestionService>();
  }

  registerService(serviceKey: string, service: IScreeningquestionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IScreeningquestionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/screeningquestion.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedScreeningquestionInput, UnifiedScreeningquestionOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalScreeningquestionOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IScreeningquestionService } from '../types';

@Injectable()
export class ScreeningquestionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ScreeningquestionService.name);
  }

  async batchAddScreeningquestions(
    unifiedScreeningquestionData: UnifiedScreeningquestionInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningquestionOutput[]> {
    return;
  }

  async addScreeningquestion(
    unifiedScreeningquestionData: UnifiedScreeningquestionInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningquestionOutput> {
        return;
  }

  async getScreeningquestion(
    id_screeningquestioning_screeningquestion: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningquestionOutput> {
       return;

  }


  async getScreeningquestions(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningquestionOutput[]> {
       return;

  }
}
