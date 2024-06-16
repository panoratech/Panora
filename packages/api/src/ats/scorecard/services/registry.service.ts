import { Injectable } from '@nestjs/common';
import { IScorecardService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IScorecardService>;

  constructor() {
    this.serviceMap = new Map<string, IScorecardService>();
  }

  registerService(serviceKey: string, service: IScorecardService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IScorecardService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/scorecard.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedScorecardInput, UnifiedScorecardOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalScorecardOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IScorecardService } from '../types';

@Injectable()
export class ScorecardService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ScorecardService.name);
  }

  async batchAddScorecards(
    unifiedScorecardData: UnifiedScorecardInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScorecardOutput[]> {
    return;
  }

  async addScorecard(
    unifiedScorecardData: UnifiedScorecardInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScorecardOutput> {
        return;
  }

  async getScorecard(
    id_scorecarding_scorecard: string,
    remote_data?: boolean,
  ): Promise<UnifiedScorecardOutput> {
       return;

  }


  async getScorecards(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScorecardOutput[]> {
       return;

  }
}
