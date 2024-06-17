import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';

import { IPermissionService } from '../types';

@Injectable()
export class PermissionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PermissionService.name);
  }

  async batchAddPermissions(
    unifiedPermissionData: UnifiedPermissionInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput[]> {
    return;
  }

  async addPermission(
    unifiedPermissionData: UnifiedPermissionInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput> {
    return;
  }

  async getPermission(
    id_permissioning_permission: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput> {
    return;
  }

  async getPermissions(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput[]> {
    return;
  }
}
