import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IDriveService } from '@filestorage/drive/types';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ServiceRegistry } from '../registry.service';
import { GoogleDriveDriveOutput } from './types';

@Injectable()
export class GoogleDriveService implements IDriveService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${FileStorageObject.file.toUpperCase()}:${GoogleDriveService.name}`,
    );
    this.registry.registerService('googledrive', this);
  }

  private async getGoogleClient(linkedUserId: string): Promise<OAuth2Client> {
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: 'googledrive',
        vertical: 'filestorage',
      },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: this.cryptoService.decrypt(connection.access_token),
      refresh_token: this.cryptoService.decrypt(connection.refresh_token),
    });

    return oauth2Client;
  }

  async addDrive(
    driveData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<GoogleDriveDriveOutput>> {
    try {
      const oauth2Client = await this.getGoogleClient(linkedUserId);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await drive.drives.create({
        requestBody: {
          name: driveData.name,
        },
      });

      const createdDrive: GoogleDriveDriveOutput = {
        id: response.data.id || '',
        name: response.data.name || '',
        kind: response.data.kind || '',
      };

      return {
        data: createdDrive,
        message: 'Google Drive created successfully',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error('Error creating Google Drive', error);
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<GoogleDriveDriveOutput[]>> {
    try {
      const { linkedUserId } = data;
      const oauth2Client = await this.getGoogleClient(linkedUserId);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await drive.drives.list({
        pageSize: 100,
        fields: 'drives(id,name,kind,createdTime)',
      });

      const drives: GoogleDriveDriveOutput[] = (response.data.drives || []).map(
        (drive) => ({
          id: drive.id || '',
          name: drive.name || '',
          kind: drive.kind || '',
          createdTime: drive.createdTime || '',
        }),
      );

      const rootDriveResponse = await drive.files.get({
        fileId: 'root',
        fields: 'name,createdTime,id,kind',
      });
      const rootDrive = rootDriveResponse.data;

      drives.push({
        id: rootDrive.id || '',
        name: rootDrive.name || '',
        kind: 'drive#drive',
        createdTime: rootDrive.createdTime || '',
      });

      this.logger.log(`Synced Google Drive drives!`);

      return {
        data: drives,
        message: 'Google Drive drives retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('Error syncing Google Drive drives', error);
      throw error;
    }
  }
}
