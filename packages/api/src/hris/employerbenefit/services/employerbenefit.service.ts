import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedEmployerBenefitInput,
  UnifiedEmployerBenefitOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEmployerBenefitOutput } from '@@core/utils/types/original/original.hris';

import { IEmployerBenefitService } from '../types';

@Injectable()
export class EmployerBenefitService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployerBenefitService.name);
  }

  async batchAddEmployerBenefits(
    unifiedEmployerBenefitData: UnifiedEmployerBenefitInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployerBenefitOutput[]> {
    return;
  }

  async addEmployerBenefit(
    unifiedEmployerBenefitData: UnifiedEmployerBenefitInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployerBenefitOutput> {
    return;
  }

  async getEmployerBenefit(
    id_employerbenefiting_employerbenefit: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployerBenefitOutput> {
    return;
  }

  async getEmployerBenefits(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployerBenefitOutput[]> {
    return;
  }
}
