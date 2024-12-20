import {
  UnifiedFilestoragePermissionInput,
  UnifiedFilestoragePermissionOutput,
} from '@filestorage/permission/types/model.unified';
import { IPermissionMapper } from '@filestorage/permission/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { OnedrivePermissionInput, OnedrivePermissionOutput } from './types';

@Injectable()
export class OnedrivePermissionMapper implements IPermissionMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'permission',
      'onedrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestoragePermissionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<OnedrivePermissionInput> {
    return;
  }

  async unify(
    source: OnedrivePermissionOutput | OnedrivePermissionOutput[],
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
    // Handling array of OnedrivePermissionOutput
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
    permission: OnedrivePermissionOutput,
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
      roles: permission.roles?.map((role) => role.toUpperCase()),
      type:
        permission.link?.type === 'edit'
          ? 'WRITE'
          : permission.link?.type === 'view'
          ? 'READ'
          : permission.link?.type,
      user_id: permission.internal_user_id,
      group_id: permission.internal_group_id,
      field_mappings,
    };
  }
}
