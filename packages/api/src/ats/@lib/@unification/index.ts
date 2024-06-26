import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { AtsObjectInput } from '@@core/utils/types/original/original.ats';
import { IUnification } from '@@core/utils/types/interface';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AtsUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<AtsUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('ats', this);
  }
  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: AtsObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<AtsObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'ats',
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
    targetType_: AtsObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'ats',
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
