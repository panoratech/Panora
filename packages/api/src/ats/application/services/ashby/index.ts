import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { AtsObject } from '@ats/@lib/@types';
import { IApplicationService } from '@ats/application/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AshbyApplicationInput, AshbyApplicationOutput } from './types';

@Injectable()
export class AshbyService implements IApplicationService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.application.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }

  async addApplication(
    applicationData: AshbyApplicationInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AshbyApplicationOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/application.create`,
        JSON.stringify(applicationData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );

      return {
        data: resp.data.results,
        message: 'Ashby application created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyApplicationOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.post(
        `${connection.account_url}/application.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const applications: AshbyApplicationOutput[] = resp.data.results;
      this.logger.log(`Synced ashby applications !`);

      return {
        data: applications,
        message: 'Ashby applications retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
