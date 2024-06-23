import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedEmploymentInput,
  UnifiedEmploymentOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEmploymentOutput } from '@@core/utils/types/original/original.hris';

import { IEmploymentService } from '../types';

@Injectable()
export class EmploymentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmploymentService.name);
  }

  async batchAddEmployments(
    unifiedEmploymentData: UnifiedEmploymentInput[],
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedEmploymentOutput[]> {
    return;
  }

  async addEmployment(
    unifiedEmploymentData: UnifiedEmploymentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmploymentOutput> {
    return;
  }

  async getEmployment(
    id_employmenting_employment: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmploymentOutput> {
    return;
  }

  async getEmployments(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedEmploymentOutput[]> {
    return;
  }
}
