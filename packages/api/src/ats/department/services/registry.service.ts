import { Injectable } from '@nestjs/common';
import { IDepartmentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IDepartmentService>;

  constructor() {
    this.serviceMap = new Map<string, IDepartmentService>();
  }

  registerService(serviceKey: string, service: IDepartmentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IDepartmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/department.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedDepartmentInput, UnifiedDepartmentOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IDepartmentService } from '../types';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DepartmentService.name);
  }

  async batchAddDepartments(
    unifiedDepartmentData: UnifiedDepartmentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput[]> {
    return;
  }

  async addDepartment(
    unifiedDepartmentData: UnifiedDepartmentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput> {
        return;
  }

  async getDepartment(
    id_departmenting_department: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput> {
       return;

  }


  async getDepartments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput[]> {
       return;

  }
}
