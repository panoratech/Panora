import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import {
  CrmObject,
  PipedriveEngagementInput,
  PipedriveEngagementOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addEngagement(
    engagementData: PipedriveEngagementInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveEngagementOutput>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/persons`,
        JSON.stringify(engagementData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Pipedrive engagement created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
    return;
  }

  async syncEngagements(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveEngagementOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/persons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
