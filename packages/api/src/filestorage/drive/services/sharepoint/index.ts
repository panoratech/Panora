import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IDriveService } from '@filestorage/drive/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SharepointDriveOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';

@Injectable()
export class SharepointService implements IDriveService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${SharepointService.name}`,
    );
    this.registry.registerService('sharepoint', this);
  }

  async addDrive(
    driveData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDriveOutput>> {
    // No API to add drive in Sharepoint
    return;
  }

  async sync(data: SyncParam): Promise<ApiResponse<SharepointDriveOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      const resp = await axios.get(`${connection.account_url}/drives`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const drives: SharepointDriveOutput[] = resp.data.value;
      this.logger.log(`Synced sharepoint drives !`);

      return {
        data: drives,
        message: 'Sharepoint drives retrived',
        statusCode: 200,
      };
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }
}
