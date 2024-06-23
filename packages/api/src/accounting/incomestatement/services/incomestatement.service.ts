import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedIncomeStatementInput,
  UnifiedIncomeStatementOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalIncomeStatementOutput } from '@@core/utils/types/original/original.accounting';

import { IIncomeStatementService } from '../types';

@Injectable()
export class IncomeStatementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(IncomeStatementService.name);
  }

  async getIncomeStatement(
    id_incomestatementing_incomestatement: string,
    remote_data?: boolean,
  ): Promise<UnifiedIncomeStatementOutput> {
    return;
  }

  async getIncomeStatements(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedIncomeStatementOutput[]> {
    return;
  }
}
