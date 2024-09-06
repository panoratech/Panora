import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisTimeoffInput,
  UnifiedHrisTimeoffOutput,
} from './model.unified';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface ITimeoffService {
  addTimeoff(
    timeoffData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTimeoffOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTimeoffOutput[]>>;
}

export interface ITimeoffMapper {
  desunify(
    source: UnifiedHrisTimeoffInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTimeoffOutput | OriginalTimeoffOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisTimeoffOutput | UnifiedHrisTimeoffOutput[]>;
}
