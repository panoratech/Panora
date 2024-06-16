import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedEeocsInput, UnifiedEeocsOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalEeocsOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IEeocsService } from '../types';

@Injectable()
export class EeocsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EeocsService.name);
  }

  async batchAddEeocss(
    unifiedEeocsData: UnifiedEeocsInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEeocsOutput[]> {
    return;
  }

  async addEeocs(
    unifiedEeocsData: UnifiedEeocsInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEeocsOutput> {
        return;
  }

  async getEeocs(
    id_eeocsing_eeocs: string,
    remote_data?: boolean,
  ): Promise<UnifiedEeocsOutput> {
       return;

  }


  async getEeocss(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEeocsOutput[]> {
       return;

  }
}
