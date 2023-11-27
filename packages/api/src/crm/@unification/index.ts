import { CrmObject, providerUnificationMapping } from '@crm/@types';
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
  if (
    providerUnificationMapping[providerName] &&
    providerUnificationMapping[providerName][targetType_]
  ) {
    return providerUnificationMapping[providerName][targetType_]['desunify'](
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
  if (
    providerUnificationMapping[providerName] &&
    providerUnificationMapping[providerName][targetType_]
  ) {
    return providerUnificationMapping[providerName][targetType_]['unify'](
      sourceObject,
      customFieldMappings,
    );
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}
