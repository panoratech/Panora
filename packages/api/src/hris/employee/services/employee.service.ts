import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedEmployeeInput,
  UnifiedEmployeeOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEmployeeOutput } from '@@core/utils/types/original/original.hris';

import { IEmployeeService } from '../types';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployeeService.name);
  }

  async batchAddEmployees(
    unifiedEmployeeData: UnifiedEmployeeInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeeOutput[]> {
    return;
  }

  async addEmployee(
    unifiedEmployeeData: UnifiedEmployeeInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeeOutput> {
    return;
  }

  async getEmployee(
    id_employeeing_employee: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeeOutput> {
    return;
  }

  async getEmployees(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmployeeOutput[]> {
    return;
  }
}
