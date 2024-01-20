/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  CrmObject,
  FreshsalesStageInput,
  FreshsalesStageOutput,
} from '@crm/@utils/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { IStageService } from '@crm/stage/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class FreshsalesService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async addStage(
    stageData: FreshsalesStageInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesStageOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const dataBody = {
        stage: stageData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/stages',
        JSON.stringify(dataBody),
        {
          headers: {
            Authorization: `Token token=${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales stage created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.stage,
        ActionType.POST,
      );
    }
  }

  async syncStages(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesStageOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://domain.freshsales.io/api/stages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data,
        message: 'Freshsales stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
