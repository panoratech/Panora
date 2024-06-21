import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedFileInput, UnifiedFileOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';

import { IFileService } from '../types';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(FileService.name);
  }

  async addFile(
    unifiedFileData: UnifiedFileInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFileOutput> {
    return;
  }

  async getFile(
    id_fileing_file: string,
    remote_data?: boolean,
  ): Promise<UnifiedFileOutput> {
    return;
  }

  async getFiles(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFileOutput[]> {
    return;
  }
}
