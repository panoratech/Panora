import { Injectable } from '@nestjs/common';
import { IApplicationService } from '@ats/application/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyApplicationInput, AshbyApplicationOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';

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
  addApplication(
    applicationData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalApplicationOutput>> {
    throw new Error('Method not implemented.');
  }

  async syncApplications(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<AshbyApplicationOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
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
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Ashby',
        AtsObject.application,
        ActionType.GET,
      );
    }
  }
}
