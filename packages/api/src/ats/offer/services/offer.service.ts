import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedOfferInput, UnifiedOfferOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';

import { IOfferService } from '../types';

@Injectable()
export class OfferService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(OfferService.name);
  }

  async batchAddOffers(
    unifiedOfferData: UnifiedOfferInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput[]> {
    return;
  }

  async addOffer(
    unifiedOfferData: UnifiedOfferInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput> {
    return;
  }

  async getOffer(
    id_offering_offer: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput> {
    return;
  }

  async getOffers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOfferOutput[]> {
    return;
  }
}
