import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { Utils } from '@filestorage/@lib/@utils';
import { IFileMapper } from '@filestorage/file/types';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from '@filestorage/file/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { Injectable } from '@nestjs/common';
import { DropboxFileInput, DropboxFileOutput } from './types';

@Injectable()
export class DropboxFileMapper implements IFileMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'file',
      'dropbox',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<DropboxFileInput> {
    // todo: do something with customFieldMappings
    return {
      path: `/${source.name}`,
      mode: 'add',
      autorename: true,
    };
  }

  async unify(
    source: DropboxFileOutput | DropboxFileOutput[],
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
    // Handling array of DropboxFileOutput
    return Promise.all(
      source.map((file) =>
        this.mapSingleFileToUnified(file, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleFileToUnified(
    file: DropboxFileOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFileOutput> {
    const result: UnifiedFilestorageFileOutput = {
      remote_id: file.id,
      remote_data: file,
      name: file.name,
      file_url: null,
      mime_type: null,
      size: file.size.toString(),
      folder_id: null,
      permissions: null,
      shared_link: null,
      field_mappings: {},
    };

    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        result.field_mappings[mapping.slug] = file[mapping.remote_id];
      }
    }

    return result;
  }
}
