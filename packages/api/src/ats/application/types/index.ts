import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from './model.unified';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IApplicationService extends IBaseObjectService {
  addApplication(
    applicationData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalApplicationOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalApplicationOutput[]>>;
}

export interface IApplicationMapper {
  desunify(
    source: UnifiedApplicationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalApplicationOutput | OriginalApplicationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedApplicationOutput | UnifiedApplicationOutput[]>;
}
