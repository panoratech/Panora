import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCampaignInput,
  UnifiedCampaignOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { ICampaignService } from '../types';

@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CampaignService.name);
  }

  async batchAddCampaigns(
    unifiedCampaignData: UnifiedCampaignInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCampaignOutput[]> {
    return;
  }

  async addCampaign(
    unifiedCampaignData: UnifiedCampaignInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCampaignOutput> {
    return;
  }

  async getCampaign(
    id_campaigning_campaign: string,
    remote_data?: boolean,
  ): Promise<UnifiedCampaignOutput> {
    return;
  }

  async getCampaigns(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCampaignOutput[]> {
    return;
  }
}
