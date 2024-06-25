import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedTrackingCategoryInput,
  UnifiedTrackingCategoryOutput,
} from './model.unified';
import { OriginalTrackingCategoryOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ITrackingCategoryService {
  addTrackingCategory(
    trackingcategoryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTrackingCategoryOutput>>;

  syncTrackingCategorys(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTrackingCategoryOutput[]>>;
}

export interface ITrackingCategoryMapper {
  desunify(
    source: UnifiedTrackingCategoryInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTrackingCategoryOutput | OriginalTrackingCategoryOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTrackingCategoryOutput | UnifiedTrackingCategoryOutput[]>;
}
