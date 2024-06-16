import { Injectable } from '@nestjs/common';
import { IBalancesheetService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IBalancesheetService>;

  constructor() {
    this.serviceMap = new Map<string, IBalancesheetService>();
  }

  registerService(serviceKey: string, service: IBalancesheetService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IBalancesheetService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/balancesheet.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedBalancesheetInput, UnifiedBalancesheetOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalBalancesheetOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IBalancesheetService } from '../types';

@Injectable()
export class BalancesheetService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BalancesheetService.name);
  }

  async batchAddBalancesheets(
    unifiedBalancesheetData: UnifiedBalancesheetInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalancesheetOutput[]> {
    return;
  }

  async addBalancesheet(
    unifiedBalancesheetData: UnifiedBalancesheetInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalancesheetOutput> {
        return;
  }

  async getBalancesheet(
    id_balancesheeting_balancesheet: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalancesheetOutput> {
       return;

  }


  async getBalancesheets(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBalancesheetOutput[]> {
       return;

  }
}
