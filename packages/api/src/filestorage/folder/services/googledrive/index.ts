import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
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

@Injectable()
export class GoogleDriveFolderService implements IFolderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
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
  ): Promise<GoogleDriveFolderOutput[]> {
    const drive = google.drive({ version: 'v3', auth });

    const rootDriveId = await drive.files
      .get({
        fileId: 'root',
        fields: 'id',
      })
      .then((res) => res.data.id);

    async function fetchDriveIds(): Promise<string[]> {
      const driveIds: string[] = ['root']; // Always include 'root' drive (My Drive)
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

      return driveIds;
    }

    // Helper function to fetch folders for a specific parent ID or root
    async function fetchFoldersForParent(
      parentId: string | null = null,
      driveId: string,
    ): Promise<GoogleDriveFolderOutput[]> {
      const folders: GoogleDriveFolderOutput[] = [];
      let pageToken: string | null = null;
      const query = parentId
        ? `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
        : `mimeType='application/vnd.google-apps.folder' and '${driveId}' in parents and trashed=false`;

      do {
        const response = await drive.files.list({
          q: query,
          fields:
            'nextPageToken, files(id, name, parents, createdTime, modifiedTime, driveId, webViewLink)',
          pageToken,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          ...(driveId !== 'root' && {
            driveId,
            corpora: 'drive',
          }),
        });

        folders.push(...(response.data.files as GoogleDriveFolderOutput[]));
        pageToken = response.data.nextPageToken ?? null;
      } while (pageToken);

      folders.forEach((folder) => {
        folder.driveId = folder.driveId || rootDriveId;
      });

      return folders;
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
      const driveIds = await fetchDriveIds();
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

      const folders = await this.recursiveGetGoogleDriveFolders(auth);

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
}
