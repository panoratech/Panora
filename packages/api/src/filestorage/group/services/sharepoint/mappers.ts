import {
  UnifiedFilestorageGroupInput,
  UnifiedFilestorageGroupOutput,
} from '@filestorage/group/types/model.unified';
import { IGroupMapper } from '@filestorage/group/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { SharepointGroupInput, SharepointGroupOutput } from './types';

@Injectable()
export class SharepointGroupMapper implements IGroupMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'filestorage',
      'group',
      'sharepoint',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageGroupInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SharepointGroupInput> {
    return;
  }

  async unify(
    source: SharepointGroupOutput | SharepointGroupOutput[],
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
    // Handling array of SharepointGroupOutput
    return Promise.all(
      source.map((group) =>
        this.mapSingleGroupToUnified(group, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleGroupToUnified(
    group: SharepointGroupOutput,
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

    // todo: do something about users
    // https://graph.microsoft.com/groups/group-id/members

    return {
      remote_id: group.id,
      remote_data: group,
      name: group.mailNickname,
      remote_was_deleted: group.deletedDateTime !== null,
      field_mappings,
      users: [],
    };
  }
}
