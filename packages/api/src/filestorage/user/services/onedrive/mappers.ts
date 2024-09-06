import {
  UnifiedFilestorageUserInput,
  UnifiedFilestorageUserOutput,
} from '@filestorage/user/types/model.unified';
import { IUserMapper } from '@filestorage/user/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OnedriveUserInput, OnedriveUserOutput } from './types';

@Injectable()
export class OnedriveUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'filestorage',
      'user',
      'onedrive',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<OnedriveUserInput> {
    return;
  }

  async unify(
    source: OnedriveUserOutput | OnedriveUserOutput[],
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
    // Handling array of OnedriveUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleUserToUnified(
    user: OnedriveUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageUserOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        if (user[mapping.slug]) {
          field_mappings[mapping.remote_id] = user[mapping.slug];
        }
      }
    }

    return {
      remote_id: user.id,
      remote_data: user,
      name: user.displayName || null,
      email: user.mail || null,
      is_me: false,
      field_mappings,
    };
  }
}
