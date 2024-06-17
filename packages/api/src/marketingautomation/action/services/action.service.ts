import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedActionInput,
  UnifiedActionOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IActionService } from '../types';

@Injectable()
export class ActionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ActionService.name);
  }

  async batchAddActions(
    unifiedActionData: UnifiedActionInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActionOutput[]> {
    return;
  }

  async addAction(
    unifiedActionData: UnifiedActionInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActionOutput> {
    return;
  }

  async getAction(
    id_actioning_action: string,
    remote_data?: boolean,
  ): Promise<UnifiedActionOutput> {
    return;
  }

  async getActions(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedActionOutput[]> {
    return;
  }
}
