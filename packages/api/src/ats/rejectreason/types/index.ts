import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from './model.unified';

export interface IRejectReasonService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalRejectReasonOutput[]>>;
}

export interface IRejectReasonMapper {
  desunify(
    source: UnifiedRejectReasonInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalRejectReasonOutput | OriginalRejectReasonOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedRejectReasonOutput | UnifiedRejectReasonOutput[]>;
}
