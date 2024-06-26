import { TargetObject, Unified, UnifyReturnType } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifySourceType } from '@@core/utils/types/unify.output';

export interface IUnification {
  desunify<T extends Unified>({
    sourceObject,
    targetType_,
    providerName,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: TargetObject;
    providerName: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<DesunifyReturnType>;

  unify<T extends UnifySourceType | UnifySourceType[]>({
    sourceObject,
    targetType_,
    providerName,
    connectionId,
    customFieldMappings,
  }: {
    sourceObject: T;
    targetType_: TargetObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
  }): Promise<UnifyReturnType>;
}

export interface IBaseSync {
  saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: any[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<any[]>;
}
