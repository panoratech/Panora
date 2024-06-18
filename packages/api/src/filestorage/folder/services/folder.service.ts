import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedFolderInput,
  UnifiedFolderOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';

import { IFolderService } from '../types';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(FolderService.name);
  }

  async batchAddFolders(
    unifiedFolderData: UnifiedFolderInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFolderOutput[]> {
    return;
  }

  async addFolder(
    unifiedFolderData: UnifiedFolderInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFolderOutput> {
    return;
  }

  async getFolder(
    id_foldering_folder: string,
    remote_data?: boolean,
  ): Promise<UnifiedFolderOutput> {
    return;
  }

  async getFolders(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFolderOutput[]> {
    return;
  }
}
