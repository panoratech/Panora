import {
  UnifiedFilestorageGroupInput,
  UnifiedFilestorageGroupOutput,
} from '@filestorage/group/types/model.unified';
import { IGroupMapper } from '@filestorage/group/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { DropboxGroupInput, DropboxGroupOutput } from './types';

@Injectable()
export class DropboxGroupMapper implements IGroupMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'filestorage',
      'group',
      'dropbox',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageGroupInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<DropboxGroupInput> {
    return;
  }

  async unify(
    source: DropboxGroupOutput | DropboxGroupOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageGroupOutput | UnifiedFilestorageGroupOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleGroupToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of DropboxGroupOutput
    return Promise.all(
      source.map((group) =>
        this.mapSingleGroupToUnified(group, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleGroupToUnified(
    group: DropboxGroupOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageGroupOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = group[mapping.remote_id];
      }
    }
    return {
      remote_id: group.group_id,
      remote_data: group,
      name: group.group_name,
      users: [],
      field_mappings,
      remote_was_deleted: null,
    };
  }
}
