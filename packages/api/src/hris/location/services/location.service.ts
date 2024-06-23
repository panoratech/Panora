import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedLocationInput,
  UnifiedLocationOutput,
} from '../types/model.unified';

import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalLocationOutput } from '@@core/utils/types/original/original.hris';

import { ILocationService } from '../types';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(LocationService.name);
  }

  async batchAddLocations(
    unifiedLocationData: UnifiedLocationInput[],
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedLocationOutput[]> {
    return;
  }

  async addLocation(
    unifiedLocationData: UnifiedLocationInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedLocationOutput> {
    return;
  }

  async getLocation(
    id_locationing_location: string,
    remote_data?: boolean,
  ): Promise<UnifiedLocationOutput> {
    return;
  }

  async getLocations(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedLocationOutput[]> {
    return;
  }
}
