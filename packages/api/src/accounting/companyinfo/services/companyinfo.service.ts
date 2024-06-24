import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCompanyInfoInput,
  UnifiedCompanyInfoOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCompanyInfoOutput } from '@@core/utils/types/original/original.accounting';

import { ICompanyInfoService } from '../types';

@Injectable()
export class CompanyInfoService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CompanyInfoService.name);
  }

  async getCompanyInfo(
    id_companyinfoing_companyinfo: string,
    remote_data?: boolean,
  ): Promise<UnifiedCompanyInfoOutput> {
    return;
  }

  async getCompanyInfos(
    connectionId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedCompanyInfoOutput[]> {
    return;
  }
}
