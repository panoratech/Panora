import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { Utils } from '@filestorage/@lib/@utils';
import { IFolderMapper } from '@filestorage/folder/types';
import {
  UnifiedFilestorageFolderInput,
  UnifiedFilestorageFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { Injectable } from '@nestjs/common';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { DropboxFolderInput, DropboxFolderOutput } from './types';

@Injectable()
export class DropboxFolderMapper implements IFolderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'folder',
      'dropbox',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<DropboxFolderInput> {
    const result: DropboxFolderInput = {
      path: `/${source.name}`,
      autorename: true,
    };

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: DropboxFolderOutput | DropboxFolderOutput[],
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
    } else {
      return await Promise.all(
        source.map((s) =>
          this.mapSingleFolderToUnified(s, connectionId, customFieldMappings),
        ),
      );
    }
  }

  private async mapSingleFolderToUnified(
    folder: DropboxFolderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFolderOutput> {
    const result: UnifiedFilestorageFolderOutput = {
      remote_id: folder.id,
      remote_data: folder,
      name: folder.name,
      size: null,
      folder_url: null,
      description: null,
      drive_id: null,
      parent_folder_id: null,
      shared_link: null,
      permissions: null,
      field_mappings: {},
    };

    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        result.field_mappings[mapping.slug] = folder[mapping.remote_id];
      }
    }
    return result;
  }
}
