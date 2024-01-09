import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import {
  CrmObject,
  PipedriveStageInput,
  PipedriveStageOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addStage(
    stageData: PipedriveStageInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveStageOutput>> {
    try {
      //TODO: check required scope  => crm.objects.stages.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/stages`,
        JSON.stringify(stageData),
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
        message: 'Pipedrive stage created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.stage,
        ActionType.POST,
      );
    }
    return;
  }

  async syncStages(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveStageOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.stages.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/stages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
