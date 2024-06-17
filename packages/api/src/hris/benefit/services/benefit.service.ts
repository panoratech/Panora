import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedBenefitInput,
  UnifiedBenefitOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalBenefitOutput } from '@@core/utils/types/original/original.hris';

import { IBenefitService } from '../types';

@Injectable()
export class BenefitService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BenefitService.name);
  }

  async batchAddBenefits(
    unifiedBenefitData: UnifiedBenefitInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBenefitOutput[]> {
    return;
  }

  async addBenefit(
    unifiedBenefitData: UnifiedBenefitInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBenefitOutput> {
    return;
  }

  async getBenefit(
    id_benefiting_benefit: string,
    remote_data?: boolean,
  ): Promise<UnifiedBenefitOutput> {
    return;
  }

  async getBenefits(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBenefitOutput[]> {
    return;
  }
}
