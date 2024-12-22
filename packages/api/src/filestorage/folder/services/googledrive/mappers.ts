import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';
import { IFolderMapper } from '@filestorage/folder/types';
import {
  UnifiedFilestorageFolderInput,
  UnifiedFilestorageFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { Injectable } from '@nestjs/common';
import { GoogleDriveFolderInput, GoogleDriveFolderOutput } from './types';

@Injectable()
export class GoogleDriveFolderMapper implements IFolderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'folder',
      'googledrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GoogleDriveFolderInput> {
    return {
      name: source.name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: source.parent_folder_id ? [source.parent_folder_id] : undefined,
    };
  }

  async unify(
    source: GoogleDriveFolderOutput | GoogleDriveFolderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedFilestorageFolderOutput | UnifiedFilestorageFolderOutput[]
  > {
    if (!Array.isArray(source)) {
      return await this.mapSingleFolderToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((folder) =>
        this.mapSingleFolderToUnified(
          folder,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleFolderToUnified(
    folder: GoogleDriveFolderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFolderOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] =
          folder[mapping.remote_id as keyof GoogleDriveFolderOutput];
      }
    }
    const opts: any = {};
    if (folder.parents && folder.parents.length > 0) {
      const folder_id = await this.utils.getFolderIdFromRemote(
        folder.parents[0],
        connectionId,
      );
      opts.folder_id = folder_id;
    }

    return {
      id: folder.internal_id ?? null,
      parent_folder_id: folder.internal_parent_folder_id ?? null,
      remote_id: folder.id,
      remote_data: folder,
      remote_drive_id: folder.driveId || null,
      remote_was_deleted: folder.trashed ?? false,
      remote_created_at: folder.createdTime
        ? new Date(folder.createdTime)
        : null,
      remote_modified_at: folder.modifiedTime
        ? new Date(folder.modifiedTime)
        : null,
      folder_url: folder.webViewLink || null,
      name: folder.name,
      permissions: folder.internal_permissions,
      ...opts,
      field_mappings,
    };
  }
}
