import { Injectable } from '@nestjs/common';
import { IDepartmentService } from '@ats/department/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { BamboohrDepartmentOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { BamboohrJob } from './types';
import { Department } from './types';

@Injectable()
export class BamboohrService implements IDepartmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.department.toUpperCase() + ':' + BamboohrService.name,
    );
    this.registry.registerService('bamboohr', this);
  }
  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<BamboohrDepartmentOutput[]>> {
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
      const jobs: BamboohrJob[] = resp.data;
      let departments: Department[] = [];
      const departementMap: { [index: string]: boolean } = {};
      if (jobs && jobs.length > 0) {
        departments = jobs
          .map((x) => {
            if (!departementMap[x.id]) {
              departementMap[x.id] = true;
              return x;
            }
            return null;
          })
          .filter((x) => x != null)
          .map((j) => j.department);
      }
      this.logger.log(`Synced bamboohr departments !`);

      return {
        data: departments,
        message: 'Bamboohr departments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
