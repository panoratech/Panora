import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { AtsObject } from '@ats/@lib/@types';
import { IInterviewService } from '@ats/interview/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AshbyInterviewOutput } from './types';

@Injectable()
export class AshbyService implements IInterviewService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.interview.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyInterviewOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.post(
        `${connection.account_url}/interviewSchedule.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const interviews: AshbyInterviewOutput[] = resp.data.results;
      this.logger.log(`Synced ashby interviews !`);

      return {
        data: interviews,
        message: 'Ashby interviews retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
