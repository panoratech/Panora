import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedScoreCardInput,
  UnifiedScoreCardOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalScoreCardOutput } from '@@core/utils/types/original/original.ats';

import { IScoreCardService } from '../types';

@Injectable()
export class ScoreCardService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ScoreCardService.name);
  }

  async batchAddScoreCards(
    unifiedScoreCardData: UnifiedScoreCardInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput[]> {
    return;
  }

  async addScoreCard(
    unifiedScoreCardData: UnifiedScoreCardInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput> {
    return;
  }

  async getScoreCard(
    id_scorecarding_scorecard: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput> {
    return;
  }

  async getScoreCards(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput[]> {
    return;
  }
}
