import { Injectable } from '@nestjs/common';
import { ICandidateService } from '@ats/candidate/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyCandidateInput, AshbyCandidateOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class AshbyService implements ICandidateService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.candidate.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }
  addCandidate(
    candidateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCandidateOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyCandidateOutput[]>> {
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
        `${connection.account_url}/candidate.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const candidates: AshbyCandidateOutput[] = resp.data.results;
      this.logger.log(`Synced ashby candidates !`);

      return {
        data: candidates,
        message: 'Ashby candidates retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Ashby',
        AtsObject.candidate,
        ActionType.GET,
      );
    }
  }
}
