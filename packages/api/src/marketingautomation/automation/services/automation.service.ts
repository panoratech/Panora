import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedAutomationInput,
  UnifiedAutomationOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IAutomationService } from '../types';

@Injectable()
export class AutomationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AutomationService.name);
  }

  async batchAddAutomations(
    unifiedAutomationData: UnifiedAutomationInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAutomationOutput[]> {
    return;
  }

  async addAutomation(
    unifiedAutomationData: UnifiedAutomationInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAutomationOutput> {
    return;
  }

  async getAutomation(
    id_automationing_automation: string,
    remote_data?: boolean,
  ): Promise<UnifiedAutomationOutput> {
    return;
  }

  async getAutomations(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAutomationOutput[]> {
    return;
  }
}
