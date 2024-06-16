import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedJobinterviewstageInput, UnifiedJobinterviewstageOutput } from './model.unified';
import { OriginalJobinterviewstageOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IJobinterviewstageService {
  addJobinterviewstage(
    jobinterviewstageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobinterviewstageOutput>>;

  syncJobinterviewstages(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalJobinterviewstageOutput[]>>;
}

export interface IJobinterviewstageMapper {
  desunify(
    source: UnifiedJobinterviewstageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalJobinterviewstageOutput | OriginalJobinterviewstageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedJobinterviewstageOutput | UnifiedJobinterviewstageOutput[];
}
