

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
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
