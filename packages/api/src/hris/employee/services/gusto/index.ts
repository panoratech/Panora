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
import { GustoEmployeeOutput } from './types';

@Injectable()
export class GustoService implements IEmployeeService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.employee.toUpperCase() + ':' + GustoService.name,
    );
    this.registry.registerService('gusto', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<GustoEmployeeOutput[]>> {
    try {
      const { linkedUserId, id_company } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gusto',
          vertical: 'hris',
        },
      });

      const company = await this.prisma.hris_companies.findUnique({
        where: {
          id_hris_company: id_company as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/v1/companies/${company.remote_id}/employees`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced gusto employees !`);

      return {
        data: resp.data,
        message: 'Gusto employees retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
