import { Injectable } from '@nestjs/common';
import { IContactService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IContactService>;

  constructor() {
    this.serviceMap = new Map<string, IContactService>();
  }

  registerService(serviceKey: string, service: IContactService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IContactService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/contact.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedMarketingautomationError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedContactInput, UnifiedContactOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalContactOutput } from '@@core/utils/types/original/original.marketingautomation';
import { unify } from '@@core/utils/unification/unify';
import { IContactService } from '../types';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(ContactService.name);
  }

  async batchAddContacts(
    unifiedContactData: UnifiedContactInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput[]> {
    return;
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
        return;
  }

  async getContact(
    id_contacting_contact: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
       return;

  }


  async getContacts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput[]> {
       return;

  }
}
