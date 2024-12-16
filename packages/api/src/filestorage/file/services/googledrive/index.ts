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
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { GoogledrivePermissionOutput } from '@filestorage/permission/services/googledrive/types';

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
    // Extract all permissions from the files
    const allPermissions: GoogledrivePermissionOutput[] = sourceData.reduce<
      GoogledrivePermissionOutput[]
    >((accumulator, file) => {
      if (file.permissions?.length) {
        accumulator.push(...file.permissions);
      }
      return accumulator;
    }, []);

    if (allPermissions.length === 0) {
      this.logger.warn('No permissions found in the provided files.');
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

    // Remove duplicate permissions based on 'id'
    const uniquePermissions: GoogledrivePermissionOutput[] = Array.from(
      new Map(
        allPermissions.map((permission) => [permission.id, permission]),
      ).values(),
    );

    this.logger.log(
      `Ingesting ${uniquePermissions.length} unique permissions.`,
    );

    // Ingest permissions using the ingestService
    const syncedPermissions = await this.ingestService.ingestData<
      UnifiedFilestoragePermissionOutput,
      GoogledrivePermissionOutput
    >(
      uniquePermissions,
      'googledrive',
      connectionId,
      'filestorage',
      'permission',
    );

    // Create a map of original permission ID to synced permission ID
    const permissionIdMap: Map<string, string> = new Map(
      syncedPermissions.map((permission) => [
        permission.remote_id,
        permission.id_fs_permission,
      ]),
    );

    // Update each file's permissions with the synced permission IDs
    sourceData.forEach((file) => {
      if (file.permissions?.length) {
        file.permissions = file.permissions
          .map((permission) => permissionIdMap.get(permission.id))
          .filter(
            (permissionId): permissionId is string =>
              permissionId !== undefined,
          );
      }
    });

    // Ingest files with updated permissions
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

  async sync(data: SyncParam, pageToken?: string) {
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

    const rootDriveId = await drive.files
      .get({
        fileId: 'root',
        fields: 'id',
      })
      .then((res) => res.data.id);

    let query =
      "mimeType!='application/vnd.google-apps.folder' and trashed = false";
    if (!pageToken) {
      const lastSyncTime = await this.getLastSyncTime(connection.id_connection);
      if (lastSyncTime) {
        console.log(`Last sync time is ${lastSyncTime.toISOString()}`);
        query += ` and modifiedTime >= '${lastSyncTime.toISOString()}'`;
      }
    }
    // Fetch the current page of files
    const response = await this.rateLimitedRequest(() =>
      drive.files.list({
        q: query,
        fields:
          'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, parents, webViewLink, driveId, permissions)',
        pageSize: BATCH_SIZE,
        pageToken: pageToken,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      }),
    );

    const files: GoogleDriveFileOutput[] = (response as any).data.files.map(
      (file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        createdTime: file.createdTime!,
        modifiedTime: file.modifiedTime!,
        size: file.size!,
        permissions: file.permissions,
        parents: file.parents,
        webViewLink: file.webViewLink,
        driveId: file.driveId || rootDriveId,
      }),
    );

    // Process the files fetched in the current batch
    if (files.length > 0) {
      await this.ingestData(
        files,
        connection.id_connection,
        custom_field_mappings,
        ingestParams,
      );
    }

    // Get the next pageToken
    const nextPageToken = (response as any).data.nextPageToken;

    if (nextPageToken) {
      // Add the next pageToken to the queue
      await this.bullQueueService
        .getThirdPartyDataIngestionQueue()
        .add('fs_file_googledrive', {
          ...data,
          pageToken: nextPageToken,
          connectionId: connection.id_connection,
        });
    }

    console.log(`Processed a batch of ${files.length} files.`);
    return {
      data: [],
      message: 'Google Drive sync completed for this batch',
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

    // Call the sync method with the pageToken and other job data
    await this.sync(
      {
        linkedUserId,
        custom_field_mappings,
        ingestParams,
      },
      pageToken,
    );
  }

  private async rateLimitedRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          this.logger.error('Error in rateLimitedRequest:', error);
          if (error.response) {
            this.logger.error('Response data:', error.response.data);
            this.logger.error('Response status:', error.response.status);
          }
          reject(error);
        }
      }, 1000 / API_RATE_LIMIT);
    });
  }

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_files.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: 'desc' },
    });
    return lastSync ? lastSync.remote_modified_at : null;
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
