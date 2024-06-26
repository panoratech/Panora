import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedPayrollRunInput,
  UnifiedPayrollRunOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPayrollRunOutput } from '@@core/utils/types/original/original.hris';

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

  async getPayrollRun(
    id_payrollruning_payrollrun: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPayrollRunOutput> {
    return;
  }

  async getPayrollRuns(
    connectionId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedPayrollRunOutput[]> {
    return;
  }
}
