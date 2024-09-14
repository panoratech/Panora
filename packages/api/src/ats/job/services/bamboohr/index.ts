import { Injectable } from '@nestjs/common';
import { IJobService } from '@ats/job/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';
import { BamboohrJobOutput } from './types';

@Injectable()
export class BamboohrService implements IJobService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.job.toUpperCase() + ':' + BamboohrService.name,
    );
    this.registry.registerService('bamboohr', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<BamboohrJobOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'bamboohr',
          vertical: 'ats',
        },
      });

      this.logger.log(`Calling BammboHR API`);
      const resp = await axios.get(
        `${connection.account_url}/v1/applicant_tracking/jobs`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const jobs: BamboohrJobOutput[] = resp.data;
      this.logger.log(`Synced bamboohr jobs !`, JSON.stringify(jobs));

      return {
        data: jobs,
        message: 'Bamboohr jobs retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
