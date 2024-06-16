import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedApplicationInput, UnifiedApplicationOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IApplicationService } from '../types';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ApplicationService.name);
  }

  async batchAddApplications(
    unifiedApplicationData: UnifiedApplicationInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput[]> {
    return;
  }

  async addApplication(
    unifiedApplicationData: UnifiedApplicationInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput> {
        return;
  }

  async getApplication(
    id_applicationing_application: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput> {
       return;

  }


  async getApplications(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedApplicationOutput[]> {
       return;

  }
}
