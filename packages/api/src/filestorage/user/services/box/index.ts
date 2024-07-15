import { Injectable } from '@nestjs/common';
import { IUserService } from '@filestorage/user/types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { BoxUserInput, BoxUserOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class BoxService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.user.toUpperCase() + ':' + BoxService.name,
    );
    this.registry.registerService('box', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<BoxUserOutput[]>> {
    try {
      const { linkedUserId } = data;

      // to sync all users we start from root user ("0") and recurse through it
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'box',
          vertical: 'filestorage',
        },
      });
      const resp = await axios.get(`${connection.account_url}/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced box users !`);

      return {
        data: resp.data.entries,
        message: 'Box users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
