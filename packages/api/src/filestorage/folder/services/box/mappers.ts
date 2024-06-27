import { BoxFolderInput, BoxFolderOutput } from './types';
import {
  UnifiedFolderInput,
  UnifiedFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { IFolderMapper } from '@filestorage/folder/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class BoxFolderMapper implements IFolderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('filestorage', 'folder', 'box', this);
  }

  async desunify(
    source: UnifiedFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxFolderInput> {
    const result = {
      name: source.name,
      parent: {
        id: await this.utils.getRemoteFolderParentId(source.parent_folder_id),
      },
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
    return;
  }

  async unify(
    source: BoxFolderOutput | BoxFolderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFolderOutput | UnifiedFolderOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleFolderToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of BoxFolderOutput
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
    folder: BoxFolderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFolderOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = folder[mapping.remote_id];
      }
    }
    await this.ingestService.ingestData<
      UnifiedPermissionOutput,
      OriginalPermissionOutput
    >(
      [{ ...folder.shared_link, parent_folder_remote_id: String(folder.id) }],
      'box',
      connectionId,
      'filestorage',
      'sharedlink',
      customFieldMappings,
    );

    return {
      remote_id: folder.id,
      name: folder.name || null,
      size: folder.size?.toString() || null,
      folder_url: folder.shared_link?.url || null,
      description: folder.description || null,
      drive_id: null,
      parent_folder_id:
        (await this.utils.getFolderIdFromRemote(
          folder.parent?.id,
          connectionId,
        )) || null,
      permission_id: null,
      field_mappings,
      //remote_created_at: folder.created_at || null,
      //remote_modified_at: folder.modified_at || null,
    };
  }
}
