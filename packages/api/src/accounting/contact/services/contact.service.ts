import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalContactOutput } from '@@core/utils/types/original/original.accounting';

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

  async addContact(
    unifiedContactData: UnifiedContactInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
    return;
  }

  async getContact(
    id_contacting_contact: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
    return;
  }

  async getContacts(
    connectionId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedContactOutput[]> {
    return;
  }
}
