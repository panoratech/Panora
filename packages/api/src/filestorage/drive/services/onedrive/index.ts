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
import { OnedriveDriveOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';

@Injectable()
export class OnedriveService implements IDriveService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${OnedriveService.name}`,
    );
    this.registry.registerService('onedrive', this);
  }

  async addDrive(
    driveData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDriveOutput>> {
    // No API to add drive in onedrive
    return;
  }

  async sync(data: SyncParam): Promise<ApiResponse<OnedriveDriveOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });

      const resp = await axios.get(`${connection.account_url}/v1.0/drives`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const drives: OnedriveDriveOutput[] = resp.data.value;
      this.logger.log(`Synced onedrive drives !`);

      return {
        data: drives,
        message: 'Onedrive drives retrived',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
