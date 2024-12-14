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
import { SharepointFolderInput, SharepointFolderOutput } from './types';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';

@Injectable()
export class SharepointFolderMapper implements IFolderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'folder',
      'sharepoint',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SharepointFolderInput> {
    const result = {
      name: source.name,
      folder: {},
      description: source.description,
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
    source: SharepointFolderOutput | SharepointFolderOutput[],
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
    return await Promise.all(
      source.map((s) =>
        this.mapSingleFolderToUnified(s, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleFolderToUnified(
    folder: SharepointFolderOutput,
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

    const opts: any = {};
    if (folder.permissions?.length) {
      const permissions = await this.coreUnificationService.unify<
        OriginalPermissionOutput[]
      >({
        sourceObject: folder.permissions,
        targetType: FileStorageObject.permission,
        providerName: 'sharepoint',
        vertical: 'filestorage',
        connectionId,
        customFieldMappings: [],
      });
      opts.permissions = permissions;

      // shared link
      if (folder.permissions.some((p) => p.link)) {
        const sharedLinks =
          await this.coreUnificationService.unify<OriginalSharedLinkOutput>({
            sourceObject: folder.permissions.find((p) => p.link),
            targetType: FileStorageObject.sharedlink,
            providerName: 'sharepoint',
            vertical: 'filestorage',
            connectionId,
            customFieldMappings: [],
          });
        opts.shared_links = sharedLinks;
      }
    }

    const result = {
      remote_id: folder.id,
      remote_data: folder,
      name: folder.name,
      folder_url: folder.webUrl,
      description: folder.description,
      drive_id: null,
      parent_folder_id: await this.utils.getFolderIdFromRemote(
        folder.parentReference?.id,
        connectionId,
      ),
      // permission: opts.permissions?.[0] || null,
      permissions: null,
      size: folder.size.toString(),
      shared_link: opts.shared_links?.[0] || null,
      field_mappings,
    };

    return result;
  }
}
