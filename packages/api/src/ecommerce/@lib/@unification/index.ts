import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { IUnification } from '@@core/utils/types/interface';
import { EcommerceObjectInput } from '@@core/utils/types/original/original.ecommerce';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { Injectable } from '@nestjs/common';
import { EcommerceObject } from '../@types';

@Injectable()
export class EcommerceUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<EcommerceUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('ecommerce', this);
  }
  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: EcommerceObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<EcommerceObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'ecommerce',
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
    targetType_: EcommerceObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'ecommerce',
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
