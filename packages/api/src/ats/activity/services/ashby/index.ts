import { Injectable } from '@nestjs/common';
import { IActivityService } from '@ats/activity/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyActivityInput, AshbyActivityOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class AshbyService implements IActivityService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.activity.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyActivityOutput[]>> {
    try {
      const { linkedUserId, candidate_id } = data;
      if (!candidate_id) return;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
      const candidate = await this.prisma.ats_candidates.findUnique({
        where: {
          id_ats_candidate: candidate_id as string,
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/candidate.listNotes`,
        JSON.stringify({
          candidateId: candidate.remote_id,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const activitys: AshbyActivityOutput[] = resp.data.results;
      this.logger.log(`Synced ashby activitys !`);

      return {
        data: activitys,
        message: 'Ashby activitys retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
