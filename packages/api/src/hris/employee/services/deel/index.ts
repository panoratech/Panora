import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { HrisObject } from '@hris/@lib/@types';
import { IEmployeeService } from '@hris/employee/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { DeelEmployeeOutput } from './types';

@Injectable()
export class DeelService implements IEmployeeService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.employee.toUpperCase() + ':' + DeelService.name,
    );
    this.registry.registerService('deel', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<DeelEmployeeOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'deel',
          vertical: 'hris',
        },
      });

      const resp = await axios.get(`${connection.account_url}/rest/v2/people`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced deel employees !`);

      return {
        data: resp.data.data,
        message: 'Deel employees retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
