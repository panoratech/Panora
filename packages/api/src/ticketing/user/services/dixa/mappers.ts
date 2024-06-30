import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { DixaUserInput, DixaUserOutput } from './types';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class dixaUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'dixa', this);
  }
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DixaUserInput {
    return {
      displayName: source.name,
      email: source.email_address,
      phoneNumber: '',
      additionalEmails: [],
      additionalPhoneNumbers: [],
      firstName: source.name.split(' ')[0],
      lastName: source.name.split(' ')[1] || '',
      middleNames: [],
      avatarUrl: '',
      externalId: '',
    };
  }

  unify(
    source: DixaUserOutput | DixaUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: DixaUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user.customAttributes[mapping.remote_id];
      }
    }

    const unifiedUser: UnifiedUserOutput = {
      remote_id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email_address: user.email,
      field_mappings: field_mappings,
    };

    return unifiedUser;
  }
}
