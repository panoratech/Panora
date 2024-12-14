import { Injectable } from '@nestjs/common';
import { IPermissionService } from '@filestorage/permission/types';
import { FileStorageObject } from '@panora/shared';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { GoogledrivePermissionOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogledriveService implements IPermissionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.permission.toUpperCase() +
        ':' +
        GoogledriveService.name,
    );
    this.registry.registerService('googledrive', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<GoogledrivePermissionOutput[]>> {
    try {
      const { linkedUserId, extra } = data;
      // TODO: Determine the source of 'extra'
      // extra?: { object_name: 'folder' | 'file'; value: string },

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'googledrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        return {
          data: [],
          message: 'Connection not found',
          statusCode: 404,
        };
      }

      let remote_id: string;

      if (extra.object_name === 'folder') {
        const folder = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: extra.value,
          },
        });

        if (!folder) {
          throw new Error('Folder not found');
        }

        remote_id = folder.remote_id;
      } else if (extra.object_name === 'file') {
        const file = await this.prisma.fs_files.findUnique({
          where: {
            id_fs_file: extra.value,
          },
        });

        if (!file) {
          throw new Error('File not found');
        }

        remote_id = file.remote_id;
      } else {
        throw new Error('Invalid object name');
      }

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });
      const drive = google.drive({ version: 'v3', auth });

      const resp: any = await drive.permissions.list({
        fileId: remote_id,
        fields: 'permissions(id, emailAddress, role, type, expirationTime)',
        supportsAllDrives: true,
      });

      return {
        data: resp.data.permissions as GoogledrivePermissionOutput[],
        message: 'Synced Google Drive permissions!',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('Error syncing Google Drive permissions', error);
      throw error;
    }
  }
}
