import { CrmObject, unificationMapping } from '@crm/@types';
import {
  CrmObjectInput,
  Unified,
  UnifyReturnType,
  UnifySourceType,
} from '@@core/utils/types';

export async function desunifyCrm<T extends Unified>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName] && mapping[providerName][targetType_]) {
    return mapping[providerName][targetType_]['desunify'](
      sourceObject,
      customFieldMappings,
    );
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}

export async function unifyCrm<T extends UnifySourceType | UnifySourceType[]>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName] && mapping[providerName][targetType_]) {
    return mapping[providerName][targetType_]['unify'](
      sourceObject,
      customFieldMappings,
    );
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}
