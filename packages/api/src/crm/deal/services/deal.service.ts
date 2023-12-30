import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedDealInput, UnifiedDealOutput } from '../types/model.unified';
import { DealResponse } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { CrmObject } from '@crm/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { unify } from '@@core/utils/unification/unify';

@Injectable()
export class DealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DealService.name);
  }

  async batchAddDeals(
    unifiedDealData: UnifiedDealInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<DealResponse>> {
    return
  }

  async addDeal(  
    unifiedDealData: UnifiedDealInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<DealResponse>> {
    return;
  }

  async getDeal(
    id_crm_deal: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<DealResponse>> {
    return;
  }

  async getDeals(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<DealResponse>> {
    return;
  }

  async updateDeal(
    id: string,
    updateDealData: Partial<UnifiedDealInput>,
  ): Promise<ApiResponse<DealResponse>> {
    return;
  }
}
