import { Injectable } from '@nestjs/common';
import { ICompanyinfoService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICompanyinfoService>;

  constructor() {
    this.serviceMap = new Map<string, ICompanyinfoService>();
  }

  registerService(serviceKey: string, service: ICompanyinfoService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICompanyinfoService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/companyinfo.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedCompanyinfoInput, UnifiedCompanyinfoOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCompanyinfoOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ICompanyinfoService } from '../types';

@Injectable()
export class CompanyinfoService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CompanyinfoService.name);
  }

  async batchAddCompanyinfos(
    unifiedCompanyinfoData: UnifiedCompanyinfoInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyinfoOutput[]> {
    return;
  }

  async addCompanyinfo(
    unifiedCompanyinfoData: UnifiedCompanyinfoInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyinfoOutput> {
        return;
  }

  async getCompanyinfo(
    id_companyinfoing_companyinfo: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyinfoOutput> {
       return;

  }


  async getCompanyinfos(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyinfoOutput[]> {
       return;

  }
}
