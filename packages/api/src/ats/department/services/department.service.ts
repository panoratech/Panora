import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';

import { IDepartmentService } from '../types';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DepartmentService.name);
  }

  async batchAddDepartments(
    unifiedDepartmentData: UnifiedDepartmentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput[]> {
    return;
  }

  async addDepartment(
    unifiedDepartmentData: UnifiedDepartmentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput> {
    return;
  }

  async getDepartment(
    id_departmenting_department: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput> {
    return;
  }

  async getDepartments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput[]> {
    return;
  }
}
