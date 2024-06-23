import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedDependentInput,
  UnifiedDependentOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDependentOutput } from '@@core/utils/types/original/original.hris';

import { IDependentService } from '../types';

@Injectable()
export class DependentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DependentService.name);
  }

  async batchAddDependents(
    unifiedDependentData: UnifiedDependentInput[],
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedDependentOutput[]> {
    return;
  }

  async addDependent(
    unifiedDependentData: UnifiedDependentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDependentOutput> {
    return;
  }

  async getDependent(
    id_dependenting_dependent: string,
    remote_data?: boolean,
  ): Promise<UnifiedDependentOutput> {
    return;
  }

  async getDependents(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedDependentOutput[]> {
    return;
  }
}
