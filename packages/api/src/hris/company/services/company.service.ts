import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.hris';
import { unify } from '@@core/utils/unification/unify';
import { ICompanyService } from '../types';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CompanyService.name);
  }

  async batchAddCompanys(
    unifiedCompanyData: UnifiedCompanyInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput[]> {
    return;
  }

  async addCompany(
    unifiedCompanyData: UnifiedCompanyInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput> {
    return;
  }

  async getCompany(
    id_companying_company: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput> {
    return;
  }

  async getCompanys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyOutput[]> {
    return;
  }
}
