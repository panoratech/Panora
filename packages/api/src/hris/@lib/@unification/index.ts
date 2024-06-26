import { HrisObject } from '@hris/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { HrisObjectInput } from '@@core/utils/types/original/original.hris';
import { IUnification } from '@@core/utils/types/interface';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HrisUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<HrisUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('hris', this);
  }

  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: HrisObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<HrisObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'hris',
      targetType_,
      providerName,
    );

    if (mapping) {
      return mapping.desunify(sourceObject, customFieldMappings);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }

  async unify<T extends UnifySourceType | UnifySourceType[]>({
    sourceObject,
    targetType_,
    providerName,
    connectionId,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: HrisObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'hris',
      targetType_,
      providerName,
    );

    if (mapping) {
      return mapping.unify(sourceObject, connectionId, customFieldMappings);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }
}
