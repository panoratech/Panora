import { AccountingObject } from '@accounting/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { AccountingObjectInput } from '@@core/utils/types/original/original.accounting';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { IUnification } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<AccountingUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('accounting', this);
  }
  async desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: AccountingObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<AccountingObjectInput> {
    const mapping = this.mappersRegistry.getService(
      'accounting',
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
    targetType_: AccountingObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType> {
    const mapping = this.mappersRegistry.getService(
      'accounting',
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
