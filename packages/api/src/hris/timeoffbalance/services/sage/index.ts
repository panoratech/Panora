import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { HrisObject } from '@hris/@lib/@types';
import { ITimeoffBalanceService } from '@hris/timeoffbalance/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SageTimeoffbalanceOutput } from './types';

@Injectable()
export class SageService implements ITimeoffBalanceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.timeoffbalance.toUpperCase() + ':' + SageService.name,
    );
    this.registry.registerService('sage', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SageTimeoffbalanceOutput[]>> {
    try {
      const { linkedUserId, id_employee } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sage',
          vertical: 'hris',
        },
      });

      const employee = await this.prisma.hris_employees.findUnique({
        where: {
          id_hris_employee: id_employee as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/api/employees/${employee.remote_id}/leave-management/balances`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': this.cryptoService.decrypt(connection.access_token),
          },
        },
      );
      this.logger.log(`Synced sage timeoffbalances !`);

      return {
        data: resp.data.data,
        message: 'Sage timeoffbalances retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
