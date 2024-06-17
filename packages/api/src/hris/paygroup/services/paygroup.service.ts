import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedPayGroupInput,
  UnifiedPayGroupOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPayGroupOutput } from '@@core/utils/types/original/original.hris';

import { IPayGroupService } from '../types';

@Injectable()
export class PayGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PayGroupService.name);
  }

  async batchAddPayGroups(
    unifiedPayGroupData: UnifiedPayGroupInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayGroupOutput[]> {
    return;
  }

  async addPayGroup(
    unifiedPayGroupData: UnifiedPayGroupInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayGroupOutput> {
    return;
  }

  async getPayGroup(
    id_paygrouping_paygroup: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayGroupOutput> {
    return;
  }

  async getPayGroups(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayGroupOutput[]> {
    return;
  }
}
