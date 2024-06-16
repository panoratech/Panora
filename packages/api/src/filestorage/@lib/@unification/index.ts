import {
  FileStorageObject,
  unificationMapping,
} from '@filestorage/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { FileStorageObjectInput } from '@@core/utils/types/original/original.file-storage';

export async function desunifyFileStorage<T extends Unified>({
  sourceObject,
  targetType_,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: FileStorageObject;
  providerName: string;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<FileStorageObjectInput> {
  const mapping = unificationMapping[targetType_];

  if (mapping && mapping[providerName]) {
    return mapping[providerName]['desunify'](sourceObject, customFieldMappings);
  }

  throw new Error(
    `Unsupported target type for ${providerName}: ${targetType_}`,
  );
}

export async function unifyFileStorage<
  T extends UnifySourceType | UnifySourceType[],
>({
  sourceObject,
  targetType_,
  providerName,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: FileStorageObject;
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
