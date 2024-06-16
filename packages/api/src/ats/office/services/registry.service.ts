import { Injectable } from '@nestjs/common';
import { IOfficeService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IOfficeService>;

  constructor() {
    this.serviceMap = new Map<string, IOfficeService>();
  }

  registerService(serviceKey: string, service: IOfficeService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IOfficeService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/office.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedOfficeInput, UnifiedOfficeOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalOfficeOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IOfficeService } from '../types';

@Injectable()
export class OfficeService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(OfficeService.name);
  }

  async batchAddOffices(
    unifiedOfficeData: UnifiedOfficeInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput[]> {
    return;
  }

  async addOffice(
    unifiedOfficeData: UnifiedOfficeInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput> {
        return;
  }

  async getOffice(
    id_officeing_office: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput> {
       return;

  }


  async getOffices(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfficeOutput[]> {
       return;

  }
}
