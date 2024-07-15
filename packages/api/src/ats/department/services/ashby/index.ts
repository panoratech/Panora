import { Injectable } from '@nestjs/common';
import { IDepartmentService } from '@ats/department/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyDepartmentInput, AshbyDepartmentOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { SyncParam } from '@@core/utils/types/interface';

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
  addDepartment(
    departmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDepartmentOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyDepartmentOutput[]>> {
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
