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
import { SharepointGroupOutput } from './types';

@Injectable()
export class SharepointService implements IGroupService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.group.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<SharepointGroupOutput[]>> {
    try {
      const { linkedUserId } = data;
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });
      // remove /sites/site_id from account_url
      const url = connection.account_url.replace(/\/sites\/.+$/, '');

      // ref: https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
      const resp = await axios.get(`${url}/groups`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      this.logger.log(`Synced sharepoint groups !`);

      return {
        data: resp.data.value,
        message: 'Sharepoint groups retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
