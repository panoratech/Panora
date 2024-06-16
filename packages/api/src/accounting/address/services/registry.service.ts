import { Injectable } from '@nestjs/common';
import { IAddressService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAddressService>;

  constructor() {
    this.serviceMap = new Map<string, IAddressService>();
  }

  registerService(serviceKey: string, service: IAddressService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAddressService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/address.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedAddressInput, UnifiedAddressOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalAddressOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IAddressService } from '../types';

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AddressService.name);
  }

  async batchAddAddresss(
    unifiedAddressData: UnifiedAddressInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput[]> {
    return;
  }

  async addAddress(
    unifiedAddressData: UnifiedAddressInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput> {
        return;
  }

  async getAddress(
    id_addressing_address: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput> {
       return;

  }


  async getAddresss(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAddressOutput[]> {
       return;

  }
}
