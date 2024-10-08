import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFileService } from '@filestorage/file/types';
import { UnifiedFilestorageFileOutput } from '@filestorage/file/types/model.unified';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ServiceRegistry } from '../registry.service';
import { GoogleDriveFileOutput } from './types';

const BATCH_SIZE = 1000; // Number of files to process in each batch
const API_RATE_LIMIT = 10; // Requests per second

@Injectable()
export class GoogleDriveService implements IFileService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
    private bullQueueService: BullQueueService,
  ) {
    this.logger.setContext(
      FileStorageObject.file.toUpperCase() + ':' + GoogleDriveService.name,
    );
    this.registry.registerService('googledrive', this);
  }

  async ingestData(
    sourceData: GoogleDriveFileOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    extraParams?: { [key: string]: any },
  ): Promise<UnifiedFilestorageFileOutput[]> {
    return this.ingestService.ingestData<
      UnifiedFilestorageFileOutput,
      GoogleDriveFileOutput
    >(
      sourceData,
      'googledrive',
      connectionId,
      'filestorage',
      'file',
      customFieldMappings,
      extraParams,
    );
  }

  async sync(data: SyncParam) {
    const { linkedUserId, custom_field_mappings, ingestParams } = data;
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: 'googledrive',
        vertical: 'filestorage',
      },
    });

    if (!connection) return;

    const auth = new OAuth2Client();
    auth.setCredentials({
      access_token: this.cryptoService.decrypt(connection.access_token),
    });
    const drive = google.drive({ version: 'v3', auth });

    const lastSyncTime = await this.getLastSyncTime(connection.id_connection);
    const query = lastSyncTime
      ? `trashed = false and modifiedTime > '${lastSyncTime.toISOString()}'`
      : 'trashed = false';

    let pageToken: string | undefined;
    do {
      const response = await this.rateLimitedRequest(() =>
        drive.files.list({
          q: query,
          fields: 'nextPageToken',
          pageSize: BATCH_SIZE,
          pageToken: pageToken,
        }),
      );

      await this.bullQueueService
        .getThirdPartyDataIngestionQueue()
        .add('fs_file_googledrive', {
          ...data,
          pageToken: response.data.nextPageToken,
          query,
          connectionId: connection.id_connection,
          custom_field_mappings,
          ingestParams,
        });

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return {
      data: [],
      message: 'Google Drive sync completed',
      statusCode: 200,
    };
  }

  async processBatch(job: any) {
    const {
      linkedUserId,
      query,
      pageToken,
      connectionId,
      custom_field_mappings,
      ingestParams,
    } = job.data;
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: 'googledrive',
        vertical: 'filestorage',
      },
    });

    if (!connection) return;

    const auth = new OAuth2Client();
    auth.setCredentials({
      access_token: this.cryptoService.decrypt(connection.access_token),
    });
    const drive = google.drive({ version: 'v3', auth });

    const response = await this.rateLimitedRequest(() =>
      drive.files.list({
        q: query,
        fields:
          'files(id, name, mimeType, modifiedTime, size, parents, webViewLink)',
        pageSize: BATCH_SIZE,
        pageToken: pageToken,
        orderBy: 'modifiedTime',
      }),
    );

    const files: GoogleDriveFileOutput[] = response.data.files.map((file) => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      modifiedTime: file.modifiedTime!,
      size: file.size!,
      parents: file.parents,
      webViewLink: file.webViewLink,
    }));

    await this.ingestData(
      files,
      connectionId,
      custom_field_mappings,
      ingestParams,
    );
  }

  private async rateLimitedRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await request();
        resolve(result);
      }, 1000 / API_RATE_LIMIT);
    });
  }

  /*async sync(data: SyncParam): Promise<ApiResponse<GoogleDriveFileOutput[]>> {
    try {
      const { linkedUserId, id_folder } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'googledrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) return;

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });
      const drive = google.drive({ version: 'v3', auth });

      const lastSyncTime = await this.getLastSyncTime(connection.id_connection);
      console.log(
        'last updated time for google drive file is ' +
          JSON.stringify(lastSyncTime),
      );
      let pageToken: string | undefined;
      let allFiles: GoogleDriveFileOutput[] = [];

      const query = lastSyncTime
        ? `trashed = false and modifiedTime > '${lastSyncTime.toISOString()}'`
        : 'trashed = false';

      do {
        const response = await drive.files.list({
          q: query,
          fields:
            'nextPageToken, files(id, name, mimeType, modifiedTime, size, parents, webViewLink)',
          pageSize: 1000,
          pageToken: pageToken,
          orderBy: 'modifiedTime',
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
        allFiles = allFiles.concat(files);
        pageToken = response.data.nextPageToken;
        if (pageToken) {
          await sleep(100); // Wait 100ms between requests to avoid hitting rate limits
        }
      } while (pageToken);
      this.logger.log(`Synced googledrive files !`);

      return {
        data: allFiles,
        message: 'Google Drive files retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }*/

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_files.findFirst({
      where: { id_connection: connectionId },
      orderBy: { modified_at: 'desc' },
    });
    return lastSync ? lastSync.modified_at : null;
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
