import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedScreeningQuestionInput,
  UnifiedScreeningQuestionOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalScreeningQuestionOutput } from '@@core/utils/types/original/original.ats';

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
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScreeningQuestionOutput> {
    return;
  }

  async getScreeningQuestions(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedScreeningQuestionOutput[]> {
    return;
  }
}
