import {
  MarketingAutomationObject,
  unificationMapping,
} from '@marketingautomation/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { MarketingAutomationObjectInput } from '@@core/utils/types/original/original.marketing-automation';

export async function desunifyMarketingAutomation<T extends Unified>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['desunify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}

export async function unifyMarketingAutomation<
  T extends UnifySourceType | UnifySourceType[],
>({
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
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['unify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}
