import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedGroupInput, UnifiedGroupOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.hris';

import { IGroupService } from '../types';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(GroupService.name);
  }

  async batchAddGroups(
    unifiedGroupData: UnifiedGroupInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedGroupOutput[]> {
    return;
  }

  async addGroup(
    unifiedGroupData: UnifiedGroupInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedGroupOutput> {
    return;
  }

  async getGroup(
    id_grouping_group: string,
    remote_data?: boolean,
  ): Promise<UnifiedGroupOutput> {
    return;
  }

  async getGroups(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedGroupOutput[]> {
    return;
  }
}
