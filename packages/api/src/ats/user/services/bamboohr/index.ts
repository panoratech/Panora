import { Injectable } from '@nestjs/common';
import { IUserService } from '@ats/user/types';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';
import { BamboohrUserOutput } from './types';

@Injectable()
export class BamboohrService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.user.toUpperCase() + ':' + BamboohrService.name,
    );
    this.registry.registerService('bamboohr', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<BamboohrUserOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'bamboohr',
          vertical: 'ats',
        },
      });
      const resp = await axios.post(`${connection.account_url}/user.list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${this.cryptoService.decrypt(connection.access_token)}:`,
          ).toString('base64')}`,
        },
      });
      const users: BamboohrUserOutput[] = resp.data.results;
      this.logger.log(`Synced bamboohr users !`);

      return {
        data: users,
        message: 'Bamboohr users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
