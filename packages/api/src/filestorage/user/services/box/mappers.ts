import { BoxUserInput, BoxUserOutput } from './types';
import {
  UnifiedFilestorageUserInput,
  UnifiedFilestorageUserOutput,
} from '@filestorage/user/types/model.unified';
import { IUserMapper } from '@filestorage/user/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoxUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('filestorage', 'user', 'box', this);
  }

  async desunify(
    source: UnifiedFilestorageUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxUserInput> {
    return;
  }

  async unify(
    source: BoxUserOutput | BoxUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageUserOutput | UnifiedFilestorageUserOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleUserToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of BoxUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleUserToUnified(
    user: BoxUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageUserOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user[mapping.remote_id];
      }
    }

    return {
      remote_id: user.id,
      name: user.name || null,
      email: user.login || null,
      is_me: false,
      field_mappings,
      //remote_created_at: user.created_at || null,
      //remote_modified_at: user.modified_at || null,
    };
  }
}
