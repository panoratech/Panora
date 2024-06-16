import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTrackingCategoryInput,
  UnifiedTrackingCategoryOutput,
} from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTrackingCategoryOutput } from '@@core/utils/types/original/original.accounting';
import { unify } from '@@core/utils/unification/unify';
import { ITrackingCategoryService } from '../types';

@Injectable()
export class TrackingCategoryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(TrackingCategoryService.name);
  }

  async batchAddTrackingCategorys(
    unifiedTrackingCategoryData: UnifiedTrackingCategoryInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingCategoryOutput[]> {
    return;
  }

  async addTrackingCategory(
    unifiedTrackingCategoryData: UnifiedTrackingCategoryInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingCategoryOutput> {
    return;
  }

  async getTrackingCategory(
    id_trackingcategorying_trackingcategory: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingCategoryOutput> {
    return;
  }

  async getTrackingCategorys(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTrackingCategoryOutput[]> {
    return;
  }
}
