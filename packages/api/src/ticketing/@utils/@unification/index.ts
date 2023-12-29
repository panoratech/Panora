import { Unified, UnifyReturnType } from '@@core/utils/types';
import { TicketingObjectInput } from '@@core/utils/types/original.input';
import { UnifySourceType } from '@@core/utils/types/unfify.output';
import { TicketingObject, unificationMapping } from '@ticketing/@utils/@types';

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
