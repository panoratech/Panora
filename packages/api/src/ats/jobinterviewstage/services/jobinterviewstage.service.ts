
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedJobInterviewStageInput, UnifiedJobInterviewStageOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IJobInterviewStageService } from '../types';

@Injectable()
export class JobInterviewStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JobInterviewStageService.name);
  }

  async batchAddJobInterviewStages(
    unifiedJobInterviewStageData: UnifiedJobInterviewStageInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput[]> {
    return;
  }

  async addJobInterviewStage(
    unifiedJobInterviewStageData: UnifiedJobInterviewStageInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput> {
        return;
  }

  async getJobInterviewStage(
    id_jobinterviewstageing_jobinterviewstage: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput> {
       return;

  }


  async getJobInterviewStages(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobInterviewStageOutput[]> {
       return;

  }
}
