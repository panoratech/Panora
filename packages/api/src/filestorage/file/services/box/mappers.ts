import { BoxFileInput, BoxFileOutput } from './types';
import {
  UnifiedFileInput,
  UnifiedFileOutput,
} from '@filestorage/file/types/model.unified';
import { IFileMapper } from '@filestorage/file/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class BoxFileMapper implements IFileMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('filestorage', 'file', 'box', this);
  }

  async desunify(
    source: UnifiedFileInput,
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
  ): Promise<UnifiedFileOutput | UnifiedFileOutput[]> {
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
  ): Promise<UnifiedFileOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = file[mapping.remote_id];
      }
    }

    await this.ingestService.ingestData<
      UnifiedPermissionOutput,
      OriginalPermissionOutput
    >(
      [{ ...file.shared_link, parent_file_remote_id: String(file.id) }],
      'box',
      connectionId,
      'filestorage',
      'sharedlink',
      customFieldMappings,
    );

    return {
      remote_id: file.id,
      name: file.name || null,
      type: file.extension || null,
      file_url: file.shared_link?.url || null,
      mime_type: file.metadata?.['content-type'] || null,
      size: file.size?.toString() || null,
      folder_id:
        (await this.utils.getFolderIdFromRemote(
          file.parent?.id,
          connectionId,
        )) || null,
      permission_id: null,
      field_mappings,
      //remote_created_at: file.created_at || null,
      //remote_modified_at: file.modified_at || null,
    };
  }
}
