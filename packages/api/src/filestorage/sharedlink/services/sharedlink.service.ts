import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';

import { ISharedLinkService } from '../types';

@Injectable()
export class SharedLinkService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SharedLinkService.name);
  }

  async batchAddSharedlinks(
    unifiedSharedlinkData: UnifiedSharedLinkInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput[]> {
    return;
  }

  async addSharedlink(
    unifiedSharedlinkData: UnifiedSharedLinkInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput> {
    return;
  }

  async getSharedlink(
    id_sharedlinking_sharedlink: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput> {
    return;
  }

  async getSharedlinks(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedSharedLinkOutput[]> {
    return;
  }
}
