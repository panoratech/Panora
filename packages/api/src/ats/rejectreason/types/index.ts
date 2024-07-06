import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from './model.unified';
import { OriginalRejectReasonOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IRejectReasonService extends IBaseObjectService {
  addRejectReason(
    rejectreasonData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalRejectReasonOutput>>;

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
