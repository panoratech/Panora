import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedBankInfoInput,
  UnifiedBankInfoOutput,
} from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { unify } from '@@core/utils/unification/unify';

@Injectable()
export class BankInfoService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(BankInfoService.name);
  }

  async batchAddBankinfos(
    unifiedBankinfoData: UnifiedBankInfoInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBankInfoOutput[]> {
    return;
  }

  async addBankinfo(
    unifiedBankinfoData: UnifiedBankInfoInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBankInfoOutput> {
    return;
  }

  async getBankinfo(
    id_bankinfoing_bankinfo: string,
    remote_data?: boolean,
  ): Promise<UnifiedBankInfoOutput> {
    return;
  }

  async getBankinfos(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedBankInfoOutput[]> {
    return;
  }
}
