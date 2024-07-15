import { CrmObject } from '@crm/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { CrmObjectInput } from '@@core/utils/types/original/original.crm';
import { IUnification } from '@@core/utils/types/interface';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
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
    connectionId,
    customFieldMappings,
    extraParams,
  }: {
    sourceObject: T;
    targetType_: CrmObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
    extraParams?: { [key: string]: any };
  }): Promise<UnifyReturnType> {
    if (targetType_ == 'engagement') {
      const engagementType = extraParams.engagement_type;
      const mapping = this.mappersRegistry.getService(
        'crm',
        targetType_,
        providerName,
      );
      return mapping.unify(
        sourceObject,
        engagementType.toUpperCase(),
        connectionId,
        customFieldMappings,
      );
    }
    const mapping = this.mappersRegistry.getService(
      'crm',
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
