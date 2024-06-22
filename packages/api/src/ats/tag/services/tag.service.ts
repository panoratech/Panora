import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTagInput, UnifiedTagOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';

import { ITagService } from '../types';

@Injectable()
export class TagService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TagService.name);
  }

  async addTag(
    unifiedTagData: UnifiedTagInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
    return;
  }

  async getTag(
    id_taging_tag: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput> {
    return;
  }

  async getTags(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTagOutput[]> {
    return;
  }
}
