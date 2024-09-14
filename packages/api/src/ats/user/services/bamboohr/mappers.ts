import {
  UnifiedAtsUserInput,
  UnifiedAtsUserOutput
} from '@ats/user/types/model.unified';
import { IUserMapper } from '@ats/user/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { BamboohrUserOutput, BambooUser } from './types';
import { AtsObject } from '@panora/shared';
import { LoggerService } from '@@core/@core-services/logger/logger.service';

@Injectable()
export class BamboohrUserMapper implements IUserMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
    private logger: LoggerService,
  ) {
    this.mappersRegistry.registerService('ats', 'user', 'bamboohr', this);

    this.logger.setContext(
      AtsObject.user.toUpperCase() + ':' + BamboohrUserMapper.name,
    );
  }

  async desunify(
    source: UnifiedAtsUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BambooUser> {
    return;
  }

  async unify(
    source: BamboohrUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsUserOutput | UnifiedAtsUserOutput[]> {
    const result: UnifiedAtsUserOutput[] = [];
    if (typeof source === 'object' && source !== null) {
      for (const key in source) {
        const user = source[key];
        const mappedUser = this.mapSingleUserToUnified(
          user,
          connectionId,
          customFieldMappings,
        );

        result.push(mappedUser);
      }
    }

    return result;
  }

  private mapSingleUserToUnified(
    user: Partial<BambooUser>,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAtsUserOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user[mapping.remote_id];
      }
    }

    return {
      remote_id: user.id + '',
      remote_data: user,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      email: user.email || null,
      disabled: user.status !== 'enabled' || null,
      ...field_mappings,
    };
  }
}
