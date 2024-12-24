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
import { GoogleDriveFileOutput } from '@filestorage/file/services/googledrive/types';
import { GoogleDriveService as GoogleDriveFileService } from '@filestorage/file/services/googledrive';

interface GoogleDriveListResponse {
  data: {
    files: GoogleDriveFolderOutput[];
    nextPageToken?: string;
  };
}

const RATE_LIMIT_DELAY = 100; // ms between requests to avoid quota issues
const MAX_API_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

@Injectable()
export class GoogleDriveFolderService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private ingestService: IngestDataService,
    private fileService: GoogleDriveFileService,
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
      const isFirstSync = !lastSyncTime;
      const folders = !isFirstSync
        ? await this.getFoldersIncremental(auth, connection.id_connection)
        : await this.recursiveGetGoogleDriveFolders(
            auth,
            connection.id_connection,
          );

      // Sync permissions for folders
      await this.ingestPermissionsForFolders(
        folders,
        connection.id_connection,
        auth,
      );

      this.logger.log(`Synced ${folders.length} Google Drive folders!`);

      if (isFirstSync) {
        const drive = google.drive({ version: 'v3', auth });
        await this.createAndSetRemoteCursor(drive, connection.id_connection);
      }

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

  private async recursiveGetGoogleDriveFolders(
    auth: OAuth2Client,
    connectionId: string,
  ): Promise<GoogleDriveFolderOutput[]> {
    const drive = google.drive({ version: 'v3', auth });

    const rootDriveId = await this.executeWithRetry(() =>
      drive.files
        .get({
          fileId: 'root',
          fields: 'id',
        })
        .then((res) => res.data.id),
    );

    // Helper function to fetch folders for a specific parent ID or root
    const fetchFoldersForParent = async (
      parentId: string | null = null,
      driveId: string,
    ): Promise<GoogleDriveFolderOutput[]> => {
      const folders: GoogleDriveFolderOutput[] = [];
      let pageToken: string | null = null;

      const buildQuery = (parentId: string | null, driveId: string): string => {
        const baseQuery = `mimeType='application/vnd.google-apps.folder'`;
        return parentId
          ? `${baseQuery} and '${parentId}' in parents`
          : `${baseQuery} and '${driveId}' in parents`;
      };

      try {
        do {
          const response = (await this.executeWithRetry(() =>
            drive.files.list({
              q: buildQuery(parentId, driveId),
              fields:
                'nextPageToken, files(id, name, parents, createdTime, modifiedTime, driveId, webViewLink, permissionIds, trashed)',
              pageToken,
              includeItemsFromAllDrives: true,
              supportsAllDrives: true,
              orderBy: 'modifiedTime',
              ...(driveId !== 'root' && {
                driveId,
                corpora: 'drive',
              }),
            }),
          )) as unknown as GoogleDriveListResponse;

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
    };

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

      await Promise.all(
        currentLevelFolders.map((folder) =>
          populateFolders(
            folder.id,
            folder.internal_id,
            level + 1,
            allFolders,
            driveId,
          ),
        ),
      );
    }

    // main logic
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
    auth: OAuth2Client,
  ): Promise<GoogleDriveFolderOutput[]> {
    if (folders.length === 0) {
      this.logger.log('No folders provided for ingesting permissions.');
      return folders;
    }

    try {
      // Extract all permissions from the folders
      const permissionsIds: string[] = Array.from(
        new Set(
          folders.reduce<string[]>((accumulator, folder) => {
            if (folder.permissionIds?.length) {
              accumulator.push(...folder.permissionIds);
            }
            return accumulator;
          }, []),
        ),
      );

      if (permissionsIds.length === 0) {
        this.logger.log('No permissions found in the provided folders.');
        return folders;
      }

      const uniquePermissions = await this.fetchPermissions(
        permissionsIds,
        folders,
        auth,
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
        if (folder.permissionIds?.length) {
          folder.internal_permissions = folder.permissionIds
            .map((permissionId) => permissionIdMap.get(permissionId))
            .filter(
              (permissionId): permissionId is string =>
                permissionId !== undefined,
            );
        }
      });

      this.logger.log(
        `Ingested ${syncedPermissions.length} googledrive permissions for folders.`,
      );
      return folders;
    } catch (error) {
      this.logger.error('Error ingesting permissions for folders', error);
      throw error;
    }
  }

  /**
   * Retrieves folders that have been modified for each drive using drive's remote_cursor
   * @param auth OAuth2 client for Google Drive API.
   * @param connectionId ID of the connection.
   * @returns Array of Google Drive folders that have been modified.
   */
  private async getFoldersIncremental(
    auth: OAuth2Client,
    connectionId: string,
  ): Promise<GoogleDriveFolderOutput[]> {
    try {
      const drive = google.drive({ version: 'v3', auth });
      const driveIds = await this.fetchDriveIds(auth);

      const modifiedFolders = await this.getModifiedFolders(
        drive,
        connectionId,
      );

      await this.assignDriveIds(modifiedFolders, auth);

      return await this.assignParentIds(
        modifiedFolders,
        connectionId,
        driveIds,
        drive,
      );
    } catch (error) {
      this.logger.error('Error in incremental folder sync', error);
      throw error;
    }
  }

  /**
   * Assigns driveId as root to folders that don't have one.
   * @param folders Array of Google Drive folders.
   * @param auth OAuth2 client for Google Drive API.
   * @returns Array of Google Drive folders with driveId assigned.
   */
  private async assignDriveIds(
    folders: GoogleDriveFolderOutput[],
    auth: OAuth2Client,
  ): Promise<GoogleDriveFolderOutput[]> {
    const drive = google.drive({ version: 'v3', auth });
    const rootDriveId = await this.executeWithRetry(() =>
      drive.files
        .get({
          fileId: 'root',
          fields: 'id',
        })
        .then((res) => res.data.id),
    );

    folders.forEach((folder) => {
      folder.driveId = folder.driveId || rootDriveId;
    });

    return folders;
  }

  /**
   * Assigns parent IDs to folders based on their parents.
   * Handles circular references and orphaned folders.
   */
  private async assignParentIds(
    folders: GoogleDriveFolderOutput[],
    connectionId: string,
    driveIds: string[],
    drive: any,
  ): Promise<GoogleDriveFolderOutput[]> {
    const folderIdToInternalIdMap = new Map<string, string>();
    const foldersToSync: GoogleDriveFolderOutput[] = [];
    let remainingFolders = folders;
    const parentLookupCache = new Map<string, string | null>();

    while (remainingFolders.length > 0) {
      const foldersStillPending = [];

      for (const folder of remainingFolders) {
        const parentId = folder.parents?.[0] || 'root';
        const internalParentId = await this.resolveParentId(
          parentId,
          folderIdToInternalIdMap,
          driveIds,
          connectionId,
          parentLookupCache,
        );

        if (internalParentId) {
          // Found parent
          const folder_internal_id = await this.getIntenalIdForFolder(
            folder.id,
            connectionId,
          );
          foldersToSync.push(
            this.createFolderWithInternalIds(
              folder,
              internalParentId,
              folder_internal_id,
            ),
          );
          folderIdToInternalIdMap.set(folder.id, folder_internal_id);
        } else {
          // Could not find parent, try in next iteration
          foldersStillPending.push(folder);
        }
      }

      if (this.isStuckInLoop(foldersStillPending, remainingFolders)) {
        const remote_folders = new Map(
          foldersToSync.map((folder) => [folder.id, folder]),
        );
        await this.handleUnresolvedFolders(
          foldersStillPending,
          foldersToSync,
          remote_folders,
          parentLookupCache,
          folderIdToInternalIdMap,
          driveIds,
          connectionId,
          drive,
        );
        break;
      }

      remainingFolders = foldersStillPending;
    }

    return foldersToSync;
  }

  private async getIntenalIdForFolder(
    folderId: string,
    connectionId: string,
  ): Promise<string> {
    const folder = await this.prisma.fs_folders.findFirst({
      where: { remote_id: folderId, id_connection: connectionId },
      select: { id_fs_folder: true },
    });
    return folder?.id_fs_folder || uuidv4();
  }

  private createFolderWithInternalIds(
    folder: GoogleDriveFolderOutput,
    internalParentId: string,
    internalId: string,
  ): GoogleDriveFolderOutput {
    return {
      ...folder,
      internal_parent_folder_id:
        internalParentId === 'root' ? null : internalParentId,
      internal_id: internalId,
    };
  }

  private isStuckInLoop(
    pending: GoogleDriveFolderOutput[],
    remaining: GoogleDriveFolderOutput[],
  ): boolean {
    return pending.length === remaining.length;
  }

  private async fetchPermissions(permissionIds, folders, auth) {
    const drive = google.drive({ version: 'v3', auth });
    const permissionIdToFolders = new Map<string, string[]>();

    for (const folder of folders) {
      if (folder.permissionIds?.length) {
        for (const permissionId of folder.permissionIds) {
          if (permissionIdToFolders.has(permissionId)) {
            permissionIdToFolders.get(permissionId)?.push(folder.id);
          } else {
            permissionIdToFolders.set(permissionId, [folder.id]);
          }
        }
      }
    }

    const permissions: GoogledrivePermissionOutput[] = [];
    const entries = Array.from(permissionIdToFolders.entries());

    // do in batches of 10
    for (let i = 0; i < entries.length; i += 10) {
      const batch = entries.slice(i, i + 10);
      const batchPromises = batch.map(([permissionId, folderIds]) =>
        drive.permissions.get({
          permissionId,
          fileId: folderIds[0],
          supportsAllDrives: true,
        }),
      );

      const batchResults = await Promise.all(batchPromises);
      permissions.push(
        ...batchResults.map(
          (result) => result.data as unknown as GoogledrivePermissionOutput,
        ),
      );
    }

    return permissions;
  }

  private async handleUnresolvedFolders(
    pending: GoogleDriveFolderOutput[],
    output: GoogleDriveFolderOutput[],
    remote_folders: Map<string, GoogleDriveFolderOutput>,
    parentLookupCache: Map<string, string | null>,
    idCache: Map<string, string | null>,
    driveIds: string[],
    connectionId: string,
    drive: any,
  ): Promise<void> {
    this.logger.warn(
      `Found ${pending.length} unresolved folders. Resolving them...`,
    );

    const getInternalParentRecursive = async (
      folder: GoogleDriveFolderOutput,
      visitedIds: Set<string> = new Set(),
    ): Promise<string | null> => {
      const remote_parent_id = folder.parents?.[0] || 'root';

      // Prevent infinite loops
      if (visitedIds.has(remote_parent_id)) {
        this.logger.warn(`Circular reference detected for folder ${folder.id}`);
        return null;
      }
      visitedIds.add(remote_parent_id);

      // Check cache first
      const internal_parent_id = await this.resolveParentId(
        remote_parent_id,
        idCache,
        driveIds,
        connectionId,
        parentLookupCache,
      );

      if (internal_parent_id) {
        return internal_parent_id;
      }

      // Try to get parent from remote folders map or API
      try {
        const parentFolder =
          remote_folders.get(remote_parent_id) ||
          (await this.executeWithRetry(() =>
            drive.files
              .get({
                fileId: remote_parent_id,
                fields: 'id,parents',
              })
              .then((response) => response.data),
          ));

        if (!parentFolder) {
          return null;
        }

        return getInternalParentRecursive(parentFolder, visitedIds);
      } catch (error) {
        this.logger.error(
          `Failed to resolve parent for folder ${folder.id}`,
          error,
        );
        return null;
      }
    };

    await Promise.all(
      pending.map(async (folder) => {
        const internal_parent_id = await getInternalParentRecursive(folder);
        const folder_internal_id = uuidv4();
        idCache.set(folder.id, folder_internal_id);
        output.push({
          ...folder,
          internal_parent_folder_id: internal_parent_id,
          internal_id: folder_internal_id,
        });
      }),
    );
  }

  private async resolveParentId(
    parentId: string,
    idMap: Map<string, string>,
    driveIds: string[],
    connectionId: string,
    cache: Map<string, string | null>,
  ): Promise<string | null> {
    if (idMap.has(parentId)) {
      return idMap.get(parentId)!;
    }

    if (driveIds.includes(parentId) || parentId === 'root') {
      return 'root';
    }

    if (cache.has(parentId)) {
      return cache.get(parentId);
    }

    const parent = await this.prisma.fs_folders.findFirst({
      where: {
        remote_id: parentId,
        id_connection: connectionId,
      },
      select: { id_fs_folder: true },
    });

    const result = parent?.id_fs_folder || null;
    cache.set(parentId, result);
    return result;
  }

  /**
   * Delays execution for a specified amount of time.
   * @param ms Milliseconds to delay.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getModifiedFolders(
    drive: ReturnType<typeof google.drive>,
    connectionId: string,
  ): Promise<GoogleDriveFolderOutput[]> {
    const folders: GoogleDriveFolderOutput[] = [];
    let remoteCursor = await this.getRemoteCursor(drive, connectionId);

    do {
      const response = await drive.changes.list({
        pageToken: remoteCursor,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 1000,
        fields:
          'nextPageToken, newStartPageToken, changes(file(id,name,mimeType,createdTime,modifiedTime,size,parents,webViewLink,driveId,trashed,permissionIds))',
      });

      const batchFolders = response.data.changes
        .filter(
          (change) =>
            change.file?.mimeType === 'application/vnd.google-apps.folder',
        )
        .map((change) => change.file);

      folders.push(...(batchFolders as GoogleDriveFolderOutput[]));

      remoteCursor = response.data.nextPageToken;
    } while (remoteCursor);

    // NOTE: remote_cursor is updated in filesSync (to be better managed)
    return folders;
  }

  private async getRemoteCursor(
    drive: ReturnType<typeof google.drive>,
    connectionId: string,
  ): Promise<string> {
    const internalDrive = await this.prisma.fs_drives.findFirst({
      where: { id_connection: connectionId }, // all drives share the same cursor for now
      select: { id_fs_drive: true, remote_cursor: true },
    });
    let remoteCursor = internalDrive?.remote_cursor;
    if (!remoteCursor) {
      remoteCursor = await this.createAndSetRemoteCursor(drive, connectionId);
    }
    return remoteCursor;
  }

  private async createAndSetRemoteCursor(
    drive: ReturnType<typeof google.drive>,
    connectionId: string,
  ): Promise<string> {
    const startPageToken = await this.executeWithRetry(() =>
      drive.changes.getStartPageToken({ supportsAllDrives: true }),
    );
    await this.updateRemoteCursor(
      startPageToken.data.startPageToken,
      connectionId,
    );
    return startPageToken.data.startPageToken;
  }

  private async updateRemoteCursor(
    remoteCursor: string,
    connectionId: string,
  ): Promise<void> {
    await this.prisma.fs_drives.updateMany({
      where: { id_connection: connectionId },
      data: { remote_cursor: remoteCursor },
    });
  }

  private async getLastSyncTime(connectionId: string): Promise<Date | null> {
    const lastSync = await this.prisma.fs_folders.findFirst({
      where: { id_connection: connectionId },
      orderBy: { remote_modified_at: 'desc' },
    });
    return lastSync ? lastSync.remote_modified_at : null;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount = 0,
  ): Promise<T> {
    try {
      await this.delay(RATE_LIMIT_DELAY);
      return await operation();
    } catch (error) {
      if (!isRateLimitError(error)) {
        throw error;
      }

      if (retryCount >= MAX_API_RETRIES) {
        throw new Error(
          `Failed after ${MAX_API_RETRIES} retries. Last error: ${error.message}`,
        );
      }

      const backoffTime = BASE_BACKOFF_MS * Math.pow(2, retryCount);
      await this.delay(backoffTime);
      return this.executeWithRetry(operation, retryCount + 1);
    }
  }
}

function isRateLimitError(
  error: unknown,
): error is { code: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    (error.code === 429 ||
      (typeof error.message === 'string' && error.message.includes('quota')))
  );
}
