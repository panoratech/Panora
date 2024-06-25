import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEmploymentInput,
  UnifiedEmploymentOutput,
} from './model.unified';
import { OriginalEmploymentOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IEmploymentService {
  addEmployment(
    employmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEmploymentOutput>>;

  syncEmployments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEmploymentOutput[]>>;
}

export interface IEmploymentMapper {
  desunify(
    source: UnifiedEmploymentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmploymentOutput | OriginalEmploymentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEmploymentOutput | UnifiedEmploymentOutput[]>;
}
