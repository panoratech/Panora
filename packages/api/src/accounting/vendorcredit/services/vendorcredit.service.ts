import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedVendorCreditInput,
  UnifiedVendorCreditOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalVendorCreditOutput } from '@@core/utils/types/original/original.accounting';

import { IVendorCreditService } from '../types';

@Injectable()
export class VendorCreditService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(VendorCreditService.name);
  }

  async batchAddVendorCredits(
    unifiedVendorCreditData: UnifiedVendorCreditInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedVendorCreditOutput[]> {
    return;
  }

  async addVendorCredit(
    unifiedVendorCreditData: UnifiedVendorCreditInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedVendorCreditOutput> {
    return;
  }

  async getVendorCredit(
    id_vendorcrediting_vendorcredit: string,
    remote_data?: boolean,
  ): Promise<UnifiedVendorCreditOutput> {
    return;
  }

  async getVendorCredits(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedVendorCreditOutput[]> {
    return;
  }
}
