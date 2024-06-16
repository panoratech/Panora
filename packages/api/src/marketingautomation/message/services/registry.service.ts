import { Injectable } from '@nestjs/common';
import { IMessageService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IMessageService>;

  constructor() {
    this.serviceMap = new Map<string, IMessageService>();
  }

  registerService(serviceKey: string, service: IMessageService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IMessageService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/message.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedMarketingautomationError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedMessageInput, UnifiedMessageOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalMessageOutput } from '@@core/utils/types/original/original.marketingautomation';
import { unify } from '@@core/utils/unification/unify';
import { IMessageService } from '../types';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(MessageService.name);
  }

  async batchAddMessages(
    unifiedMessageData: UnifiedMessageInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedMessageOutput[]> {
    return;
  }

  async addMessage(
    unifiedMessageData: UnifiedMessageInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedMessageOutput> {
        return;
  }

  async getMessage(
    id_messageing_message: string,
    remote_data?: boolean,
  ): Promise<UnifiedMessageOutput> {
       return;

  }


  async getMessages(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedMessageOutput[]> {
       return;

  }
}
