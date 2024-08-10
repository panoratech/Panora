import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedMarketingautomationMessageInput,
  UnifiedMarketingautomationMessageOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

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

  async getMessage(
    id_messageing_message: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedMarketingautomationMessageOutput> {
    return;
  }

  async getMessages(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedMarketingautomationMessageOutput[]> {
    return;
  }
}
