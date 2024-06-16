import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTrackingcategoryInput, UnifiedTrackingcategoryOutput } from './model.unified';
import { OriginalTrackingcategoryOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ITrackingcategoryService {
  addTrackingcategory(
    trackingcategoryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTrackingcategoryOutput>>;

  syncTrackingcategorys(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTrackingcategoryOutput[]>>;
}

export interface ITrackingcategoryMapper {
  desunify(
    source: UnifiedTrackingcategoryInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTrackingcategoryOutput | OriginalTrackingcategoryOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTrackingcategoryOutput | UnifiedTrackingcategoryOutput[];
}
