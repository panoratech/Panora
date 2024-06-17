import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { MarketingAutomationObjectInput } from '@@core/utils/types/original/original.marketing-automation';
import { IUnification } from '@@core/utils/types/interface';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketingAutomationUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<MarketingAutomationUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('marketingautomation', this);
  }
  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: MarketingAutomationObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<MarketingAutomationObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'marketingautomation',
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
    targetType_: MarketingAutomationObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'marketingautomation',
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
