import { AshbyDepartmentInput, AshbyDepartmentOutput } from './types';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from '@ats/department/types/model.unified';
import { IDepartmentMapper } from '@ats/department/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyDepartmentMapper implements IDepartmentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'department', 'ashby', this);
  }

  async desunify(
    source: UnifiedDepartmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyDepartmentInput> {
    return;
  }

  async unify(
    source: AshbyDepartmentOutput | AshbyDepartmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDepartmentOutput | UnifiedDepartmentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDepartmentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyDepartmentOutput
    return Promise.all(
      source.map((department) =>
        this.mapSingleDepartmentToUnified(
          department,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleDepartmentToUnified(
    department: AshbyDepartmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDepartmentOutput> {
    return {
      remote_id: department.id,
      remote_data: department,
      name: department.name || null,
    };
  }
}
