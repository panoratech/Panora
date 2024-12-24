import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import {
  OriginalPermissionOutput,
  OriginalSharedLinkOutput,
} from '@@core/utils/types/original/original.file-storage';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { Utils } from '@filestorage/@lib/@utils';
import { IFileMapper } from '@filestorage/file/types';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from '@filestorage/file/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SharepointFileInput, SharepointFileOutput } from './types';

@Injectable()
export class SharepointFileMapper implements IFileMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'file',
      'sharepoint',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SharepointFileInput> {
    // todo: do something with customFieldMappings
    return {
      name: source.name,
      file: {
        mimeType: source.mime_type,
      },
      size: parseInt(source.size),
      parentReference: {
        id: source.folder_id,
      },
    };
  }

  async unify(
    source: SharepointFileOutput | SharepointFileOutput[],
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
    // Handling array of SharepointFileOutput
    return Promise.all(
      source.map((file) =>
        this.mapSingleFileToUnified(file, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleFileToUnified(
    file: SharepointFileOutput,
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
    if (file.permissions?.length) {
      const permissions = await this.coreUnificationService.unify<
        OriginalPermissionOutput[]
      >({
        sourceObject: file.permissions,
        targetType: FileStorageObject.permission,
        providerName: 'sharepoint',
        vertical: 'filestorage',
        connectionId,
        customFieldMappings: [],
      });
      opts.permissions = permissions;

      // shared link
      if (file.permissions.some((p) => p.link)) {
        const sharedLinks =
          await this.coreUnificationService.unify<OriginalSharedLinkOutput>({
            sourceObject: file.permissions.find((p) => p.link),
            targetType: FileStorageObject.sharedlink,
            providerName: 'sharepoint',
            vertical: 'filestorage',
            connectionId,
            customFieldMappings: [],
          });
        opts.shared_links = sharedLinks;
      }
    }

    // todo: handle folder

    return {
      remote_id: file.id,
      remote_data: file,
      name: file.name,
      file_url: file.webUrl,
      mime_type: file.file.mimeType,
      size: file.size.toString(),
      folder_id: null,
      // permission: opts.permissions?.[0] || null,
      permissions: null,
      shared_link: opts.shared_links?.[0] || null,
      field_mappings,
    };
  }
}
