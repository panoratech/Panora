import { PipedriveUserInput, PipedriveUserOutput } from './types';
import {
  UnifiedCrmUserInput,
  UnifiedCrmUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class PipedriveUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'user', 'pipedrive', this);
  }
  desunify(
    source: UnifiedCrmUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveUserInput {
    const result: PipedriveUserInput = {
      name: source.name,
      email: source.email,
    };

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: PipedriveUserOutput | PipedriveUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmUserOutput | UnifiedCrmUserOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    // Handling array of PipedriveUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private mapSingleUserToUnified(
    user: PipedriveUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmUserOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user[mapping.remote_id];
      }
    }

    return {
      remote_id: String(user.id),
      remote_data: user,
      name: user.name,
      email: user.email,
      field_mappings,
    };
  }
}
