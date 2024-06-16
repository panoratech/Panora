import { AccountingObject, unificationMapping } from '@accounting/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { AccountingObjectInput } from '@@core/utils/types/original/original.accounting';

export async function desunifyAccounting<T extends Unified>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['desunify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}

export async function unifyAccounting<
  T extends UnifySourceType | UnifySourceType[],
>({
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
}): Promise<UnifyReturnType> {
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['unify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}
