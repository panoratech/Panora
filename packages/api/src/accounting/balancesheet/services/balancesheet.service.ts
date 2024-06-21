import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedBalanceSheetInput,
  UnifiedBalanceSheetOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalBalanceSheetOutput } from '@@core/utils/types/original/original.accounting';

import { IBalanceSheetService } from '../types';

@Injectable()
export class BalanceSheetService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BalanceSheetService.name);
  }

  async getBalanceSheet(
    id_balancesheeting_balancesheet: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalanceSheetOutput> {
    return;
  }

  async getBalanceSheets(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalanceSheetOutput[]> {
    return;
  }
}
