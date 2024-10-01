import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { IUserService } from '@ticketing/user/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { GorgiasUserOutput } from './types';

@Injectable()
export class GorgiasService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + GorgiasService.name,
    );
    this.registry.registerService('gorgias', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<GorgiasUserOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.get(`${connection.account_url}/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced gorgias users !`);

      return {
        data: resp.data._results,
        message: 'Gorgias users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
