
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedRejectReasonInput, UnifiedRejectReasonOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IRejectReasonService } from '../types';

@Injectable()
export class RejectReasonService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(RejectReasonService.name);
  }

  async batchAddRejectReasons(
    unifiedRejectReasonData: UnifiedRejectReasonInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput[]> {
    return;
  }

  async addRejectReason(
    unifiedRejectReasonData: UnifiedRejectReasonInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput> {
        return;
  }

  async getRejectReason(
    id_rejectreasoning_rejectreason: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput> {
       return;

  }


  async getRejectReasons(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedRejectReasonOutput[]> {
       return;

  }
}
