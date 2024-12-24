import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';
import { IFileMapper } from '@filestorage/file/types';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from '@filestorage/file/types/model.unified';
import { Injectable } from '@nestjs/common';
import { GoogleDriveFileInput, GoogleDriveFileOutput } from './types';

@Injectable()
export class GoogleDriveFileMapper implements IFileMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'file',
      'googledrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GoogleDriveFileInput> {
    return {
      name: source.name,
      mimeType: source.mime_type,
      parents: source.folder_id ? [source.folder_id] : undefined,
    };
  }

  async unify(
    source: GoogleDriveFileOutput | GoogleDriveFileOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFileOutput | UnifiedFilestorageFileOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleFileToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((file) =>
        this.mapSingleFileToUnified(file, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleFileToUnified(
    file: GoogleDriveFileOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFileOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = file[mapping.remote_id];
      }
    }
    const opts: any = {};
    if (file.parents && file.parents.length > 0) {
      const folder_id = await this.utils.getFolderIdFromRemote(
        file.parents[0],
        connectionId,
      );
      opts.folder_id = folder_id;
    }

    return {
      remote_id: file.id,
      remote_data: file,
      remote_folder_id:
        file.parents && file.parents.length > 0 ? file.parents[0] : null,
      remote_drive_id: file.driveId || null,
      name: file.name,
      file_url: file.webViewLink || file.webContentLink || null,
      mime_type: file.mimeType || null,
      size: file.size || null,
      permissions: file.internal_permissions,
      shared_link: null,
      ...opts,
      field_mappings,
      created_at: file.createdTime ? new Date(file.createdTime) : null,
      modified_at: file.modifiedTime ? new Date(file.modifiedTime) : null,
      remote_created_at: file.createdTime ? new Date(file.createdTime) : null,
      remote_modified_at: file.modifiedTime
        ? new Date(file.modifiedTime)
        : null,
      remote_was_deleted: file.trashed ?? false,
    };
  }
}
