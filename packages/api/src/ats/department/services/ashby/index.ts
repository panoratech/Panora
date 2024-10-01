import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { AtsObject } from '@ats/@lib/@types';
import { IDepartmentService } from '@ats/department/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AshbyDepartmentOutput } from './types';

@Injectable()
export class AshbyService implements IDepartmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.department.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }
  async sync(data: SyncParam): Promise<ApiResponse<AshbyDepartmentOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.post(
        `${connection.account_url}/departement.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const departments: AshbyDepartmentOutput[] = resp.data.results;
      this.logger.log(`Synced ashby departments !`);

      return {
        data: departments,
        message: 'Ashby departments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
