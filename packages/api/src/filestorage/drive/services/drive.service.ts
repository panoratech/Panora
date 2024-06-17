import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedDriveInput, UnifiedDriveOutput } from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';

import { IDriveService } from '../types';

@Injectable()
export class DriveService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(DriveService.name);
  }

  async batchAddDrives(
    unifiedDriveData: UnifiedDriveInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDriveOutput[]> {
    return;
  }

  async addDrive(
    unifiedDriveData: UnifiedDriveInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDriveOutput> {
    return;
  }

  async getDrive(
    id_driveing_drive: string,
    remote_data?: boolean,
  ): Promise<UnifiedDriveOutput> {
    return;
  }

  async getDrives(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDriveOutput[]> {
    return;
  }
}
