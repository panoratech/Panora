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
import { BoxFileInput, BoxFileOutput } from './types';

@Injectable()
export class BoxFileMapper implements IFileMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('filestorage', 'file', 'box', this);
  }

  async desunify(
    source: UnifiedFilestorageFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxFileInput> {
    return;
  }

  async unify(
    source: BoxFileOutput | BoxFileOutput[],
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
    // Handling array of BoxFileOutput
    return Promise.all(
      source.map((file) =>
        this.mapSingleFileToUnified(file, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleFileToUnified(
    file: BoxFileOutput,
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
    let opts: any = {};
    if (file.shared_link) {
      const sharedLinks = (await this.coreUnificationService.unify<
        OriginalSharedLinkOutput[]
      >({
        sourceObject: [file.shared_link],
        targetType: FileStorageObject.sharedlink,
        providerName: 'box',
        vertical: 'filestorage',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedFilestorageSharedlinkOutput[];
      opts = {
        shared_link: sharedLinks[0],
      };
    }

    return {
      remote_id: file.id,
      remote_data: file,
      name: file.name || null,
      //type: file.extension || null,
      file_url: file.shared_link?.url || null,
      mime_type: this.utils.getMimeType(file.name) || null,
      size: file.size?.toString() || null,
      permission: null,
      field_mappings,
      folder_id: null,
      ...opts,
      //remote_created_at: file.created_at || null,
      //remote_modified_at: file.modified_at || null,
    };
  }
}
