import { ZohoUserInput, ZohoUserOutput } from './types';

import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class ZohoUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'user', 'zoho', this);
  }
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoUserInput {
    return;
  }

  unify(
    source: ZohoUserOutput | ZohoUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotUserOutput
    return source.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: ZohoUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    return;
  }
}
