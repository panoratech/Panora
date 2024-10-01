import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFileService } from '@filestorage/file/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ServiceRegistry } from '../registry.service';
import { GoogleDriveFileOutput } from './types';

@Injectable()
export class GoogleDriveService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.file.toUpperCase() + ':' + GoogleDriveService.name,
    );
    this.registry.registerService('googledrive', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<GoogleDriveFileOutput[]>> {
    try {
      const { connection, id_folder } = data;

      if (!connection) return;

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.list({
        q: 'trashed = false',
        fields:
          'files(id, name, mimeType, modifiedTime, size, parents, webViewLink)',
        pageSize: 1000, // Adjust as needed
      });

      const files: GoogleDriveFileOutput[] = response.data.files.map(
        (file) => ({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          modifiedTime: file.modifiedTime!,
          size: file.size!,
          parents: file.parents,
          webViewLink: file.webViewLink,
        }),
      );
      this.logger.log(`Synced googledrive files !`);

      return {
        data: files,
        message: 'Google Drive files retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(fileId: string, connection: any): Promise<Buffer> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
          responseType: 'arraybuffer',
        },
      );
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(
        `Error downloading file from Google Drive: ${error.message}`,
        error,
      );
      throw new Error('Failed to download file from Google Drive');
    }
  }
}
