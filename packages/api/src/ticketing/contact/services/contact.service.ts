import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '../types/model.unified';
import { ContactResponse } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '@ticketing/@utils/@registry/registry.service';
import { unify } from '@@core/utils/unification/unify';

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
}
