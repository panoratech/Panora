import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedHrisEmployeepayrollrunInput,
  UnifiedHrisEmployeepayrollrunOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEmployeePayrollRunOutput } from '@@core/utils/types/original/original.hris';

import { IEmployeePayrollRunService } from '../types';

@Injectable()
export class EmployeePayrollRunService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployeePayrollRunService.name);
  }
  async getEmployeePayrollRun(
    id_employeepayrollruning_employeepayrollrun: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmployeepayrollrunOutput> {
    return;
  }

  async getEmployeePayrollRuns(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedHrisEmployeepayrollrunOutput[]> {
    return;
  }
}
