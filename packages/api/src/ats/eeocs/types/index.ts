import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAtsEeocsInput, UnifiedAtsEeocsOutput } from './model.unified';
import { OriginalEeocsOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IEeocsService extends IBaseObjectService {
  addEeocs(
    eeocsData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEeocsOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalEeocsOutput[]>>;
}

export interface IEeocsMapper {
  desunify(
    source: UnifiedAtsEeocsInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEeocsOutput | OriginalEeocsOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsEeocsOutput | UnifiedAtsEeocsOutput[]>;
}
