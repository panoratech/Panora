import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedEmailInput, UnifiedEmailOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

import { IEmailService } from '../types';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmailService.name);
  }

  async batchAddEmails(
    unifiedEmailData: UnifiedEmailInput[],
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedEmailOutput[]> {
    return;
  }

  async addEmail(
    unifiedEmailData: UnifiedEmailInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmailOutput> {
    return;
  }

  async getEmail(
    id_emailing_email: string,
    remote_data?: boolean,
  ): Promise<UnifiedEmailOutput> {
    return;
  }

  async getEmails(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedEmailOutput[]> {
    return;
  }
}
