import { Injectable } from '@nestjs/common';
import { IScreeningQuestionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IScreeningQuestionService>;

  constructor() {
    this.serviceMap = new Map<string, IScreeningQuestionService>();
  }

  registerService(serviceKey: string, service: IScreeningQuestionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IScreeningQuestionService {
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
import { UnifiedScreeningQuestionInput, UnifiedScreeningQuestionOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalScreeningQuestionOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IScreeningQuestionService } from '../types';

@Injectable()
export class ScreeningQuestionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ScreeningQuestionService.name);
  }

  async batchAddScreeningQuestions(
    unifiedScreeningQuestionData: UnifiedScreeningQuestionInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningQuestionOutput[]> {
    return;
  }

  async addScreeningQuestion(
    unifiedScreeningQuestionData: UnifiedScreeningQuestionInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningQuestionOutput> {
        return;
  }

  async getScreeningQuestion(
    id_screeningquestioning_screeningquestion: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningQuestionOutput> {
       return;

  }


  async getScreeningQuestions(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningQuestionOutput[]> {
       return;

  }
}
