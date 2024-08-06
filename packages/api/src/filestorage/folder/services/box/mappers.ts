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
import { BoxFolderInput, BoxFolderOutput } from './types';
import { FileStorageObject } from '@filestorage/@lib/@types';

@Injectable()
export class BoxFolderMapper implements IFolderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('filestorage', 'folder', 'box', this);
  }

  async desunify(
    source: UnifiedFilestorageFolderInput,
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
  ): Promise<UnifiedFilestorageFolderOutput | UnifiedFilestorageFolderOutput[]> {
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
  ): Promise<UnifiedFilestorageFolderOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = folder[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (folder.shared_link) {
      const sharedLinks = (await this.coreUnificationService.unify<
        OriginalSharedLinkOutput[]
      >({
        sourceObject: [folder.shared_link],
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
      remote_id: folder.id,
      remote_data: folder,
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
      permission: null,
      field_mappings,
      ...opts,
      //remote_created_at: folder.created_at || null,
      //remote_modified_at: folder.modified_at || null,
    };
  }
}
