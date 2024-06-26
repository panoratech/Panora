import { BoxGroupInput, BoxGroupOutput } from './types';
import {
  UnifiedGroupInput,
  UnifiedGroupOutput,
} from '@filestorage/group/types/model.unified';
import { IGroupMapper } from '@filestorage/group/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoxGroupMapper implements IGroupMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('filestorage', 'group', 'box', this);
  }

  async desunify(
    source: UnifiedGroupInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxGroupInput> {
    return;
  }

  async unify(
    source: BoxGroupOutput | BoxGroupOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedGroupOutput | UnifiedGroupOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleGroupToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of BoxGroupOutput
    return Promise.all(
      source.map((group) =>
        this.mapSingleGroupToUnified(group, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleGroupToUnified(
    group: BoxGroupOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedGroupOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = group[mapping.remote_id];
      }
    }
    return {
      remote_id: group.id,
      name: group.name || null,
      users: null,
      remote_was_deleted: null,
      //created_at: group.created_at || null,
      //modified_at: group.modified_at || null,
    };
  }
}
