import { EncryptionService } from '@@core/encryption/encryption.service';
import { EnvironmentService } from '@@core/environment/environment.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { Injectable } from '@nestjs/common';
import {
  TicketingObject,
  ZendeskAttachmentInput,
} from '@ticketing/@utils/@types';
import { IAttachmentService } from '@ticketing/attachment/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class ZendeskService implements IAttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.attachment.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk_t', this);
  }
  addAttachment(
    attachmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskAttachmentInput>> {
    throw new Error('Method not implemented.');
  }
  syncAttachments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskAttachmentInput[]>> {
    throw new Error('Method not implemented.');
  }
}
