import { FileStorageObject } from '@filestorage/@lib/@types';
import { Unified, UnifyReturnType } from '@@core/utils/types';
import { UnifySourceType } from '@@core/utils/types/unify.output';
import { FileStorageObjectInput } from '@@core/utils/types/original/original.file-storage';
import { IUnification } from '@@core/utils/types/interface';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { Injectable } from '@nestjs/common';
@Injectable()
export class FileStorageUnificationService implements IUnification {
  constructor(
    private registry: UnificationRegistry<FileStorageUnificationService>,
    private mappersRegistry: MappersRegistry,
  ) {
    this.registry.registerService('filestorage', this);
  }

  async desunify<T extends Unified>({
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
    const mapping = this.mappersRegistry.getService(
      'filestorage',
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
    const mapping = this.mappersRegistry.getService(
      'filestorage',
      targetType_,
      providerName,
    );

    if (mapping) {
      return mapping.unify(sourceObject, customFieldMappings);
    }

    throw new Error(
      `Unsupported target type for ${providerName}: ${targetType_}`,
    );
  }
}
