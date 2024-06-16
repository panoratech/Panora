import { Injectable } from '@nestjs/common';
import { IInterviewService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IInterviewService>;

  constructor() {
    this.serviceMap = new Map<string, IInterviewService>();
  }

  registerService(serviceKey: string, service: IInterviewService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IInterviewService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/interview.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedInterviewInput, UnifiedInterviewOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalInterviewOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IInterviewService } from '../types';

@Injectable()
export class InterviewService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(InterviewService.name);
  }

  async batchAddInterviews(
    unifiedInterviewData: UnifiedInterviewInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInterviewOutput[]> {
    return;
  }

  async addInterview(
    unifiedInterviewData: UnifiedInterviewInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInterviewOutput> {
        return;
  }

  async getInterview(
    id_interviewing_interview: string,
    remote_data?: boolean,
  ): Promise<UnifiedInterviewOutput> {
       return;

  }


  async getInterviews(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedInterviewOutput[]> {
       return;

  }
}
