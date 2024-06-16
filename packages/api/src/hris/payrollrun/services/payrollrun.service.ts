import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedPayrollRunInput,
  UnifiedPayrollRunOutput,
} from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPayrollRunOutput } from '@@core/utils/types/original/original.hris';
import { unify } from '@@core/utils/unification/unify';
import { IPayrollRunService } from '../types';

@Injectable()
export class PayrollRunService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PayrollRunService.name);
  }

  async batchAddPayrollRuns(
    unifiedPayrollRunData: UnifiedPayrollRunInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayrollRunOutput[]> {
    return;
  }

  async addPayrollRun(
    unifiedPayrollRunData: UnifiedPayrollRunInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayrollRunOutput> {
    return;
  }

  async getPayrollRun(
    id_payrollruning_payrollrun: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayrollRunOutput> {
    return;
  }

  async getPayrollRuns(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayrollRunOutput[]> {
    return;
  }
}
