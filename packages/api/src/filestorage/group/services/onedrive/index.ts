import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IGroupService } from '@filestorage/group/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { OnedriveGroupOutput } from './types';

@Injectable()
export class OnedriveService implements IGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.group.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveGroupOutput[]>> {
    try {
      const { linkedUserId } = data;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      // remove /sites/site_id from account_url
      const url = connection.account_url.replace(/\/sites\/.+$/, '');

      // ref: https://learn.microsoft.com/en-us/graph/api/group-list?view=graph-rest-1.0&tabs=http
      const resp = await axios.get(`${url}/groups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      this.logger.log(`Synced onedrive groups !`);

      return {
        data: resp.data.value,
        message: 'Onedrive groups retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
