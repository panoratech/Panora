import { HrisObject, unificationMapping } from '@hris/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { HrisObjectInput } from '@@core/utils/types/original/original.hris';

export async function desunifyHris<T extends Unified>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['desunify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}

export async function unifyHris<T extends UnifySourceType | UnifySourceType[]>({
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
}): Promise<UnifyReturnType> {
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['unify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}
