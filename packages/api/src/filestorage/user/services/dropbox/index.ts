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
import { DropboxUserOutput } from './types';

@Injectable()
export class DropboxService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.user.toUpperCase()}:${DropboxService.name}`,
    );
    this.registry.registerService('dropbox', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<DropboxUserOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'dropbox',
          vertical: 'filestorage',
        },
      });

      // ref: https://www.dropbox.com/developers/documentation/http/teams#team-members-list
      const resp = await axios.post(
        `${connection.account_url}/team/members/list_2`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced dropbox users !`);

      return {
        data: resp.data.members as DropboxUserOutput[],
        message: 'Dropbox users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
