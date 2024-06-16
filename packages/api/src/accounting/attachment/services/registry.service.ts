import { Injectable } from '@nestjs/common';
import { IAttachmentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAttachmentService>;

  constructor() {
    this.serviceMap = new Map<string, IAttachmentService>();
  }

  registerService(serviceKey: string, service: IAttachmentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAttachmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

    cat > "services/attachment.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, UnifiedAccountingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedAttachmentInput, UnifiedAttachmentOutput } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { IAttachmentService } from '../types';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(AttachmentService.name);
  }

  async batchAddAttachments(
    unifiedAttachmentData: UnifiedAttachmentInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput[]> {
    return;
  }

  async addAttachment(
    unifiedAttachmentData: UnifiedAttachmentInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
        return;
  }

  async getAttachment(
    id_attachmenting_attachment: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput> {
       return;

  }


  async getAttachments(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAttachmentOutput[]> {
       return;

  }
}
