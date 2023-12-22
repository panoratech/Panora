import {
  TicketingObjectInput,
  Unified,
  UnifyReturnType,
  UnifySourceType,
} from '@@core/utils/types';
import { TicketingObject, providerUnificationMapping } from '@ticketing/@types';

export async function desunifyTicketing<T extends Unified>({
  sourceObject,
  targetType_,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: TicketingObject;
  providerName: string;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<TicketingObjectInput> {
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

export async function unifyTicketing<
  T extends UnifySourceType | UnifySourceType[],
>({
  sourceObject,
  targetType_,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: TicketingObject;
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
