import { BoxSharedLinkInput, BoxSharedLinkOutput } from './types';
import {
  UnifiedFilestorageSharedlinkInput,
  UnifiedFilestorageSharedlinkOutput,
} from '@filestorage/sharedlink/types/model.unified';
import { ISharedLinkMapper } from '@filestorage/sharedlink/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class BoxSharedLinkMapper implements ISharedLinkMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'sharedlink',
      'box',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageSharedlinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxSharedLinkInput> {
    return;
  }

  async unify(
    source: BoxSharedLinkOutput | BoxSharedLinkOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageSharedlinkOutput | UnifiedFilestorageSharedlinkOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleSharedLinkToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of BoxSharedLinkOutput
    return Promise.all(
      source.map((sharedlink) =>
        this.mapSingleSharedLinkToUnified(
          sharedlink,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleSharedLinkToUnified(
    sharedlink: BoxSharedLinkOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageSharedlinkOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = sharedlink[mapping.remote_id];
      }
    }

    return {
      remote_id: null, // todo null value in sync
      remote_data: sharedlink,
      url: sharedlink.url || null,
      download_url: sharedlink.download_url || null,
      scope: sharedlink.access,
      password_protected: sharedlink.is_password_enabled,
      password: null,
      field_mappings,
      //remote_created_at: sharedlink.created_at || null,
      //remote_modified_at: sharedlink.modified_at || null,
    };
  }
}
