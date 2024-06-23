import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTimeoffInput,
  UnifiedTimeoffOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';

import { ITimeoffService } from '../types';

@Injectable()
export class TimeoffService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TimeoffService.name);
  }

  async batchAddTimeoffs(
    unifiedTimeoffData: UnifiedTimeoffInput[],
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedTimeoffOutput[]> {
    return;
  }

  async addTimeoff(
    unifiedTimeoffData: UnifiedTimeoffInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffOutput> {
    return;
  }

  async getTimeoff(
    id_timeoffing_timeoff: string,
    remote_data?: boolean,
  ): Promise<UnifiedTimeoffOutput> {
    return;
  }

  async getTimeoffs(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedTimeoffOutput[]> {
    return;
  }
}
