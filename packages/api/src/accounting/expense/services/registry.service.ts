import { Injectable } from '@nestjs/common';
import { IExpenseService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IExpenseService>;

  constructor() {
    this.serviceMap = new Map<string, IExpenseService>();
  }

  registerService(serviceKey: string, service: IExpenseService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IExpenseService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/expense.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedExpenseInput, UnifiedExpenseOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalExpenseOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IExpenseService } from '../types';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ExpenseService.name);
  }

  async batchAddExpenses(
    unifiedExpenseData: UnifiedExpenseInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedExpenseOutput[]> {
    return;
  }

  async addExpense(
    unifiedExpenseData: UnifiedExpenseInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedExpenseOutput> {
        return;
  }

  async getExpense(
    id_expenseing_expense: string,
    remote_data?: boolean,
  ): Promise<UnifiedExpenseOutput> {
       return;

  }


  async getExpenses(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedExpenseOutput[]> {
       return;

  }
}
