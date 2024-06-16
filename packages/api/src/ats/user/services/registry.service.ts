import { Injectable } from '@nestjs/common';
import { IUserService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IUserService>;

  constructor() {
    this.serviceMap = new Map<string, IUserService>();
  }

  registerService(serviceKey: string, service: IUserService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IUserService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/user.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAtsError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedUserInput, UnifiedUserOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ats';
import { unify } from '@@core/utils/unification/unify';
import { IUserService } from '../types';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(UserService.name);
  }

  async batchAddUsers(
    unifiedUserData: UnifiedUserInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput[]> {
    return;
  }

  async addUser(
    unifiedUserData: UnifiedUserInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput> {
        return;
  }

  async getUser(
    id_usering_user: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput> {
       return;

  }


  async getUsers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput[]> {
       return;

  }
}
