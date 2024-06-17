import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCandidateInput,
  UnifiedCandidateOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';

import { ICandidateService } from '../types';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CandidateService.name);
  }

  async batchAddCandidates(
    unifiedCandidateData: UnifiedCandidateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput[]> {
    return;
  }

  async addCandidate(
    unifiedCandidateData: UnifiedCandidateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
    return;
  }

  async getCandidate(
    id_candidateing_candidate: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
    return;
  }

  async getCandidates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput[]> {
    return;
  }
}
