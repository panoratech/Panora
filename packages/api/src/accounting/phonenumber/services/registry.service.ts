import { Injectable } from '@nestjs/common';
import { IPhonenumberService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPhonenumberService>;

  constructor() {
    this.serviceMap = new Map<string, IPhonenumberService>();
  }

  registerService(serviceKey: string, service: IPhonenumberService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPhonenumberService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/phonenumber.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedPhonenumberInput, UnifiedPhonenumberOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalPhonenumberOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IPhonenumberService } from '../types';

@Injectable()
export class PhonenumberService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PhonenumberService.name);
  }

  async batchAddPhonenumbers(
    unifiedPhonenumberData: UnifiedPhonenumberInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhonenumberOutput[]> {
    return;
  }

  async addPhonenumber(
    unifiedPhonenumberData: UnifiedPhonenumberInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhonenumberOutput> {
        return;
  }

  async getPhonenumber(
    id_phonenumbering_phonenumber: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhonenumberOutput> {
       return;

  }


  async getPhonenumbers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPhonenumberOutput[]> {
       return;

  }
}
