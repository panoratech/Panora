import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IUserService } from '@filestorage/user/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { OnedriveUserOutput } from './types';

@Injectable()
export class OnedriveService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.user.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveUserOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.get(`${connection.account_url}/v1.0/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      this.logger.log(`Synced onedrive users !`);

      return {
        data: resp.data.value,
        message: 'Onedrive users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing onedrive users !`,
        error.message || 'Unknown',
      );
      throw error;
    }
  }
}
