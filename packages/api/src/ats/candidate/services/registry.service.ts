import { Injectable } from '@nestjs/common';
import { ICandidateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICandidateService>;

  constructor() {
    this.serviceMap = new Map<string, ICandidateService>();
  }

  registerService(serviceKey: string, service: ICandidateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICandidateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/candidate.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedCandidateInput, UnifiedCandidateOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { ICandidateService } from '../types';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CandidateService.name);
  }

  async batchAddCandidates(
    unifiedCandidateData: UnifiedCandidateInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput[]> {
    return;
  }

  async addCandidate(
    unifiedCandidateData: UnifiedCandidateInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
        return;
  }

  async getCandidate(
    id_candidateing_candidate: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput> {
       return;

  }


  async getCandidates(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCandidateOutput[]> {
       return;

  }
}
