import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { IFolderService } from '@filestorage/folder/types';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ServiceRegistry } from '../registry.service';
import { GoogleDriveFolderInput, GoogleDriveFolderOutput } from './types';
import { v4 as uuidv4 } from 'uuid';
import { GoogledrivePermissionOutput } from '@filestorage/permission/services/googledrive/types';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';

interface GoogleDriveListResponse {
  data: {
    files: GoogleDriveFolderOutput[];
    nextPageToken?: string;
  };
}

const GOOGLE_DRIVE_QUOTA_DELAY = 100; // ms between requests
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

@Injectable()
export class GoogleDriveFolderService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(
      `${FileStorageObject.folder.toUpperCase()}:${
        GoogleDriveFolderService.name
      }`,
    );
    this.registry.registerService('googledrive', this);
  }

  async addFolder(
    folderData: GoogleDriveFolderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GoogleDriveFolderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'googledrive',
          vertical: 'filestorage',
        },
      });

      if (!connection) {
        return {
          data: null,
          message: 'Connection not found',
          statusCode: 404,
        };
      }

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });
      const drive = google.drive({ version: 'v3', auth });

      const fileMetadata = {
        name: folderData.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: folderData.parents,
      };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, createdTime, modifiedTime, parents',
      });

      const createdFolder: GoogleDriveFolderOutput = {
        id: response.data.id!,
        name: response.data.name!,
        mimeType: response.data.mimeType!,
        createdTime: response.data.createdTime!,
        modifiedTime: response.data.modifiedTime!,
        parents: response.data.parents,
      };

      return {
        data: createdFolder,
        message: 'Google Drive folder created',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error('Error creating Google Drive folder', error);
      throw error;
    }
  }

  async recursiveGetGoogleDriveFolders(
    auth: OAuth2Client,
    connectionId: string,
  ): Promise<GoogleDriveFolderOutput[]> {
    const drive = google.drive({ version: 'v3', auth });

    const lastSyncTime = await this.getLastSyncTime(connectionId);
    if (lastSyncTime) {
      console.log(`Last sync time is ${lastSyncTime.toISOString()}`);
    }

    const rootDriveId = await drive.files
      .get({
        fileId: 'root',
        fields: 'id',
      })
      .then((res) => res.data.id);

    // Helper function to fetch folders for a specific parent ID or root
    async function fetchFoldersForParent(
      parentId: string | null = null,
      driveId: string,
    ): Promise<GoogleDriveFolderOutput[]> {
      const folders: GoogleDriveFolderOutput[] = [];
      let pageToken: string | null = null;

      const buildQuery = (parentId: string | null, driveId: string): string => {
        let baseQuery = `mimeType='application/vnd.google-apps.folder' and trashed=false`;
        if (lastSyncTime) {
          baseQuery += ` and modifiedTime >= '${lastSyncTime.toISOString()}'`;
        }
        return parentId
          ? `${baseQuery} and '${parentId}' in parents`
          : `${baseQuery} and '${driveId}' in parents`;
      };

      const executeWithRetry = async (
        pageToken: string | null,
        retryCount = 0,
      ): Promise<GoogleDriveListResponse> => {
        try {
          await new Promise((resolve) =>
            setTimeout(resolve, GOOGLE_DRIVE_QUOTA_DELAY),
          );

          const resp = await drive.files.list({
            q: buildQuery(parentId, driveId),
            fields:
              'nextPageToken, files(id, name, parents, createdTime, modifiedTime, driveId, webViewLink, permissions)',
            pageToken,
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            orderBy: 'modifiedTime',
            ...(driveId !== 'root' && {
              driveId,
              corpora: 'drive',
            }),
          });

          return resp as unknown as GoogleDriveListResponse;
        } catch (error) {
          if (!isGoogleApiError(error)) {
            throw error;
          }

          const { code, message } = error;

          if (retryCount >= MAX_RETRIES) {
            throw new Error(
              `Failed to fetch Google Drive folders after ${MAX_RETRIES} retries. Last error: ${message}`,
            );
          }

          // Handle rate limiting and quota errors
          if (code === 429 || message.includes('quota')) {
            const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            return executeWithRetry(pageToken, retryCount + 1);
          }

          throw error;
        }
      };

      try {
        do {
          const response = await executeWithRetry(pageToken);

          if (response.data.files?.length) {
            folders.push(...response.data.files);
          }

          pageToken = response.data.nextPageToken ?? null;
        } while (pageToken);

        // Set default driveId for folders that don't have one
        folders.forEach((folder) => {
          folder.driveId = folder.driveId || rootDriveId;
        });

        return folders;
      } catch (error) {
        throw new Error(
          `Error fetching Google Drive folders: ${error.message}`,
        );
      }
    }

    // Recursive function to populate folders level by level
    async function populateFolders(
      parentId: string | null = null, // Parent Folder ID returned by google drive api
      internalParentId: string | null = null, // Parent Folder ID in panora db
      level = 0,
      allFolders: GoogleDriveFolderOutput[] = [],
      driveId: string,
    ): Promise<void> {
      const currentLevelFolders = await fetchFoldersForParent(
        parentId,
        driveId,
      );

      currentLevelFolders.forEach((folder) => {
        folder.internal_id = uuidv4();
        folder.internal_parent_folder_id = internalParentId;
      });

      allFolders.push(...currentLevelFolders);

      for (const folder of currentLevelFolders) {
        await populateFolders(
          folder.id,
          folder.internal_id,
          level + 1,
          allFolders,
          driveId,
        );
      }
    }

    try {
      const driveIds = await this.fetchDriveIds(auth);
      const googleDriveFolders: GoogleDriveFolderOutput[] = [];

      for (const driveId of driveIds) {
        await populateFolders(null, null, 0, googleDriveFolders, driveId);
      }

      return googleDriveFolders;
    } catch (error) {
      this.logger.error('Error in recursiveGetGoogleDriveFolders', error);
      throw error;
    }
  }

  private async fetchDriveIds(auth: OAuth2Client): Promise<string[]> {
    const drive = google.drive({ version: 'v3', auth });
    const driveIds: string[] = [];
    let pageToken: string | null = null;

    do {
      const response = await drive.drives.list({
        pageToken,
        pageSize: 100,
        fields: 'nextPageToken, drives(id, name)',
      });

      if (response.data.drives) {
        const ids = response.data.drives.map((drive) => drive.id);
        driveIds.push(...ids);
      }

      pageToken = response.data.nextPageToken ?? null;
    } while (pageToken);

    // add root drive id
    const rootDrive = await drive.files.get({
      fileId: 'root',
      fields: 'id',
    });
    driveIds.push(rootDrive.data.id);

    return driveIds;
  }

  /**
   * Ingests permissions for the provided Google Drive folders into the database.
   */
  async ingestPermissionsForFolders(
    folders: GoogleDriveFolderOutput[],
    connectionId: string,
  ): Promise<GoogleDriveFolderOutput[]> {
    if (folders.length === 0) {
      this.logger.warn('No folders provided for ingesting permissions.');
      return folders;
    }

    try {
      // Extract all permissions from the folders
      const allPermissions: GoogledrivePermissionOutput[] = folders.reduce<
        GoogledrivePermissionOutput[]
      >((accumulator, folder) => {
        if (folder.permissions?.length) {
          accumulator.push(...folder.permissions);
        }
        return accumulator;
      }, []);

      if (allPermissions.length === 0) {
        this.logger.warn('No permissions found in the provided folders.');
        return folders;
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

      // Update each folder's permissions with the synced permission IDs
      folders.forEach((folder) => {
        if (folder.permissions?.length) {
          folder.permissions = folder.permissions
            .map((permission) => permissionIdMap.get(permission.id))
            .filter(
              (permissionId): permissionId is string =>
                permissionId !== undefined,
            );
        }
      });

      this.logger.log('Successfully ingested and updated folder permissions.');
      return folders;
    } catch (error) {
      this.logger.error('Error ingesting permissions for folders', error);
      throw error;
    }
  }

  /**
   * Gets folders modified since last sync while preserving parent-child relationships.
   * Processes folders in order of known parent IDs to maintain hierarchy.
   * Handles orphaned folders and circular references by breaking out of processing.
   */
  private async getFoldersIncremental(
    auth: OAuth2Client,
    connectionId: string,
    lastSyncTime: Date,
  ): Promise<GoogleDriveFolderOutput[]> {
    const MAX_RETRIES = 5;
    const INITIAL_BACKOFF = 1000; // 1 second

    try {
      const drive = google.drive({ version: 'v3', auth });
      const driveIds = await this.fetchDriveIds(auth);

      const modifiedFolders = await this.getModifiedFoldersWithRetry(
        drive,
        lastSyncTime,
        MAX_RETRIES,
        INITIAL_BACKOFF,
      );
      const folderIdToInternalIdMap = new Map<string, string>();
      const foldersToSync: GoogleDriveFolderOutput[] = []; // output
      let remainingFolders = modifiedFolders;

      // Create a cache for parent lookups to minimize DB queries
      const parentLookupCache = new Map<string, string | null>();

      async function getParentFromDb(parentId: string): Promise<string | null> {
        if (parentLookupCache.has(parentId)) {
          return parentLookupCache.get(parentId);
        }

        const parent = await this.prisma.fs_folders.findFirst({
          where: {
            remote_id: parentId,
            id_connection: connectionId,
          },
          select: { id_fs_folder: true },
        });

        const result = parent?.id_fs_folder || null;
        parentLookupCache.set(parentId, result);
        return result;
      }

      while (remainingFolders.length > 0) {
        const foldersStillPending: GoogleDriveFolderOutput[] = [];

        for (const folder of remainingFolders) {
          const parentId = folder.parents?.[0] || 'root';
          let internalParentId: string | null = null;

          // Check in memory maps first
          if (folderIdToInternalIdMap.has(parentId)) {
            internalParentId = folderIdToInternalIdMap.get(parentId)!;
          } else if (driveIds.includes(parentId) || parentId === 'root') {
            internalParentId = 'root';
          } else {
            // Only query DB if necessary
            internalParentId = await getParentFromDb.call(this, parentId);
          }

          if (internalParentId) {
            // Parent found - create internal ID and add to sync list
            const folder_internal_id = uuidv4();
            foldersToSync.push({
              ...folder,
              internal_parent_folder_id:
                internalParentId === 'root' ? null : internalParentId,
              internal_id: folder_internal_id,
            });
            folderIdToInternalIdMap.set(folder.id, folder_internal_id);
          } else {
            // Parent not found - try again in next iteration
            foldersStillPending.push(folder);
          }
        }

        // Check if we're stuck in a loop (no folders processed in this iteration)
        if (foldersStillPending.length === remainingFolders.length) {
          this.logger.error(
            `Processing stopped with ${foldersStillPending.length} unresolved folders - possible orphans or circular references`,
            'foldersStillPending',
            `${JSON.stringify(foldersStillPending)}`,
          );
          console.log('foldersStillPending', foldersStillPending);
          throw new Error('Processing stopped with unresolved folders');
        }

        remainingFolders = foldersStillPending;
      }

      return foldersToSync;
    } catch (error) {
      this.logger.error('Error in incremental folder sync', error);
      throw error;
    }
  }

  /**
   * Fetches modified folders with retry logic for handling rate limits.
   */
  private async getModifiedFoldersWithRetry(
    drive: any,
    lastSyncTime: Date,
    maxRetries: number,
    initialBackoff: number,
  ): Promise<any[]> {
    let attempt = 0;
    let backoff = initialBackoff;

    while (attempt <= maxRetries) {
      try {
        return await this.getModifiedFolders(drive, lastSyncTime);
      } catch (error) {
        if (
          isGoogleApiError(error) &&
          (error.code === 429 || error.message.includes('quota'))
        ) {
          if (attempt === maxRetries) {
            this.logger.error(
              'Max retries reached for fetching modified folders.',
              error.message,
            );
            throw new Error(
              'Failed to fetch modified folders due to rate limits.',
            );
          }
          this.logger.warn(
            `Rate limit encountered. Retrying attempt ${
              attempt + 1
            } after ${backoff}ms.`,
            error.message,
          );
          await this.delay(backoff);
          backoff *= 2; // Exponential backoff
          attempt += 1;
        } else {
          this.logger.error(
            'Unexpected error while fetching modified folders.',
            error,
          );
          throw error;
        }
      }
    }

    return [];
  }

  /**
   * Delays execution for a specified amount of time.
   * @param ms Milliseconds to delay.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getModifiedFolders(
    drive: any,
    lastSyncTime: Date,
  ): Promise<any[]> {
    let pageToken: string | null = null;
    const folders: any[] = [];
    const query = `modifiedTime >= '${lastSyncTime.toISOString()}'`;

    do {
      const response = await drive.files.list({
        q: query,
        fields:
          'nextPageToken, files(id, name, parents, createdTime, modifiedTime, driveId, webViewLink, permissions)',
        pageToken,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        orderBy: 'modifiedTime',
      });

      if (response.data.files?.length) {
        folders.push(...response.data.files);
      }

      pageToken = response.data.nextPageToken ?? null;
    } while (pageToken);

    return folders;
  }

  async sync(data: SyncParam): Promise<ApiResponse<GoogleDriveFolderOutput[]>> {
    try {
      const { linkedUserId } = data;

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

      const auth = new OAuth2Client();
      auth.setCredentials({
        access_token: this.cryptoService.decrypt(connection.access_token),
      });

      const lastSyncTime = await this.getLastSyncTime(connection.id_connection);

      const folders = lastSyncTime
        ? await this.getFoldersIncremental(
            auth,
            connection.id_connection,
            lastSyncTime,
          )
        : await this.recursiveGetGoogleDriveFolders(
            auth,
            connection.id_connection,
          );

      await this.ingestPermissionsForFolders(folders, connection.id_connection);
      this.logger.log(`Synced ${folders.length} Google Drive folders!`);

      return {
        data: folders,
        message: 'Google Drive folders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('Error syncing Google Drive folders', error);
      console.log(error);
      throw error;
    }
  }

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_folders.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: 'desc' },
    });
    return lastSync ? lastSync.remote_modified_at : null;
  }

  /**
   * Type guard for Google API errors
   */
  private isGoogleApiError(
    error: unknown,
  ): error is { code: number; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }
}

// Type guard for Google API errors
function isGoogleApiError(
  error: unknown,
): error is { code: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
