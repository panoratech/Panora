import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from './model.unified';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IApplicationService {
  addApplication(
    applicationData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalApplicationOutput>>;

  syncApplications(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalApplicationOutput[]>>;
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
