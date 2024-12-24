import {
  UnifiedFilestoragePermissionInput,
  UnifiedFilestoragePermissionOutput,
} from '@filestorage/permission/types/model.unified';
import { IPermissionMapper } from '@filestorage/permission/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import {
  GoogledrivePermissionInput,
  GoogledrivePermissionOutput,
} from './types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class GoogledrivePermissionMapper implements IPermissionMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'permission',
      'googledrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestoragePermissionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GoogledrivePermissionInput> {
    return;
  }

  async unify(
    source: GoogledrivePermissionOutput | GoogledrivePermissionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedFilestoragePermissionOutput | UnifiedFilestoragePermissionOutput[]
  > {
    if (!Array.isArray(source)) {
      return await this.mapSinglePermissionToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of GoogledrivePermissionOutput
    return Promise.all(
      source.map((permission) =>
        this.mapSinglePermissionToUnified(
          permission,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSinglePermissionToUnified(
    permission: GoogledrivePermissionOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestoragePermissionOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = permission[mapping.remote_id];
      }
    }

    return {
      remote_id: permission.id,
      remote_data: permission,
      roles: [permission.role],
      type: permission.type,
      user_id: null,
      group_id: null,
      field_mappings,
    };
  }
}
