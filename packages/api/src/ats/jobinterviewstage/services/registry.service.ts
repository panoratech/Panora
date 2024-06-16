import { Injectable } from '@nestjs/common';
import { IJobinterviewstageService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJobinterviewstageService>;

  constructor() {
    this.serviceMap = new Map<string, IJobinterviewstageService>();
  }

  registerService(serviceKey: string, service: IJobinterviewstageService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJobinterviewstageService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/jobinterviewstage.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedJobinterviewstageInput, UnifiedJobinterviewstageOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalJobinterviewstageOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IJobinterviewstageService } from '../types';

@Injectable()
export class JobinterviewstageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JobinterviewstageService.name);
  }

  async batchAddJobinterviewstages(
    unifiedJobinterviewstageData: UnifiedJobinterviewstageInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobinterviewstageOutput[]> {
    return;
  }

  async addJobinterviewstage(
    unifiedJobinterviewstageData: UnifiedJobinterviewstageInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobinterviewstageOutput> {
        return;
  }

  async getJobinterviewstage(
    id_jobinterviewstageing_jobinterviewstage: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobinterviewstageOutput> {
       return;

  }


  async getJobinterviewstages(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedJobinterviewstageOutput[]> {
       return;

  }
}
