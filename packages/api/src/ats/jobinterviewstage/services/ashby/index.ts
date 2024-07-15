import { Injectable } from '@nestjs/common';
import { IJobInterviewStageService } from '@ats/jobinterviewstage/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
  AshbyJobInterviewStageInput,
  AshbyJobInterviewStageOutput,
} from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class AshbyService implements IJobInterviewStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.jobinterviewstage.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }
  addJobInterviewStage(
    jobinterviewstageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobInterviewStageOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<AshbyJobInterviewStageOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/interviewStage.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const jobinterviewstages: AshbyJobInterviewStageOutput[] =
        resp.data.results;
      this.logger.log(`Synced ashby jobinterviewstages !`);

      return {
        data: jobinterviewstages,
        message: 'Ashby jobinterviewstages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
