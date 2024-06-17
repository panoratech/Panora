import { CrmObject } from '@crm/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { CrmObjectInput } from '@@core/utils/types/original/original.crm';
import { IUnification } from '@@core/utils/types/interface';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';

export class CrmUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<CrmUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('crm', this);
  }

  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: CrmObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<CrmObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'crm',
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
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: CrmObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    // TODO
    /*if (targetType_.startsWith('engagement')) {
      const mapping = unificationMapping[targetType_.split('_').shift()];
      const engagementType = targetType_.split('_').pop();
      return mapping.unify(sourceObject, engagementType, customFieldMappings);
    }*/
    const mapping = this.mappersRegistry.getService(
      'crm',
      targetType_,
      providerName,
    );
    if (mapping) {
      return mapping.unify(sourceObject, customFieldMappings);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }
}
