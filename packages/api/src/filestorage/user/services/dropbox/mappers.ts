import {
  UnifiedFilestorageUserInput,
  UnifiedFilestorageUserOutput,
} from '@filestorage/user/types/model.unified';
import { IUserMapper } from '@filestorage/user/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { DropboxUserInput, DropboxUserOutput } from './types';

@Injectable()
export class DropboxUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'filestorage',
      'user',
      'dropbox',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<DropboxUserInput> {
    return;
  }

  async unify(
    source: DropboxUserOutput | DropboxUserOutput[],
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
    // Handling array of DropboxUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleUserToUnified(
    user: DropboxUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageUserOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        if (user.profile.hasOwnProperty(mapping.slug)) {
          field_mappings[mapping.remote_id] =
            user.profile[mapping.slug] || null;
        }
      }
    }

    return {
      remote_id: user.profile.account_id,
      remote_data: user,
      name: user.profile.name?.display_name || null,
      email: user.profile.email,
      is_me: false,
      field_mappings,
    };
  }
}
