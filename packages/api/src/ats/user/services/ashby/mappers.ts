import { AshbyUserInput, AshbyUserOutput } from './types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
  UserAccessRole,
} from '@ats/user/types/model.unified';
import { IUserMapper } from '@ats/user/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyUserMapper implements IUserMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'user', 'ashby', this);
  }

  mapToUserAccessRole(
    data:
      | 'Organization Admin'
      | 'Elevated Access'
      | 'Limited Access'
      | 'External Recruiter',
  ): UserAccessRole | string {
    switch (data) {
      case 'Organization Admin':
        return 'SUPER_ADMIN';
      case 'Elevated Access':
        return 'ADMIN';
      case 'Limited Access':
        return 'LIMITED_TEAM_MEMBER';
      case 'External Recruiter':
        return 'INTERVIEWER';
    }
  }

  async desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyUserInput> {
    return;
  }

  async unify(
    source: AshbyUserOutput | AshbyUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedUserOutput | UnifiedUserOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleUserToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleUserToUnified(
    user: AshbyUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedUserOutput> {
    return {
      remote_id: user.id,
      remote_data: user,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      email: user.email || null,
      disabled: user.isEnabled || null,
      access_role: this.mapToUserAccessRole(user.globalRole as any),
      remote_modified_at: user.updatedAt || null,
    };
  }
}
