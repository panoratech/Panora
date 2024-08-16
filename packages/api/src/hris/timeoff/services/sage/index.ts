import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { HrisObject } from '@hris/@lib/@types';
import { ITimeoffService } from '@hris/timeoff/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SageTimeoffOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';

@Injectable()
export class SageService implements ITimeoffService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.timeoff.toUpperCase() + ':' + SageService.name,
    );
    this.registry.registerService('sage', this);
  }
  addTimeoff(
    timeoffData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTimeoffOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(data: SyncParam): Promise<ApiResponse<SageTimeoffOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sage',
          vertical: 'hris',
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/api/leave-management/requests`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': this.cryptoService.decrypt(connection.access_token),
          },
        },
      );
      this.logger.log(`Synced sage timeoffs !`);

      return {
        data: resp.data.data,
        message: 'Sage timeoffs retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
