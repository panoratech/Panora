import {
  ApiResponse,
  TargetObject,
  Unified,
  UnifyReturnType,
} from '@@core/utils/types';
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
    extraParams,
  }: {
    sourceObject: T;
    targetType_: TargetObject;
    providerName: string;
    connectionId: string;
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[];
    extraParams?: { [key: string]: any };
  }): Promise<UnifyReturnType>;
}

export type SyncLinkedUserType = {
  integrationId: string;
  linkedUserId: string;
  [key: string]: any;
};

export interface IBaseSync {
  saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: any[],
    originSource: string,
    remote_data: Record<string, any>[],
    ...rest: any
  ): Promise<any[]>;

  kickstartSync?(...params: any[]): Promise<void>;

  syncForLinkedUser?(param: SyncLinkedUserType): Promise<void>;

  removeInDb?(connection_id: string, remote_id: string): Promise<void>;
}

export type SyncParam = {
  linkedUserId: string;
  custom_field_mappings?: {
    slug: string;
    remote_id: string;
  }[];
  ingestParams: { [key: string]: any };
  [key: string]: any;
};
export interface IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<any>>;
  ingestData?(
    sourceData: any[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    extraParams?: { [key: string]: any },
  ): Promise<any[]>;
}
