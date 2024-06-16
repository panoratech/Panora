import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedScreeningquestionInput, UnifiedScreeningquestionOutput } from './model.unified';
import { OriginalScreeningquestionOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IScreeningquestionService {
  addScreeningquestion(
    screeningquestionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalScreeningquestionOutput>>;

  syncScreeningquestions(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalScreeningquestionOutput[]>>;
}

export interface IScreeningquestionMapper {
  desunify(
    source: UnifiedScreeningquestionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalScreeningquestionOutput | OriginalScreeningquestionOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedScreeningquestionOutput | UnifiedScreeningquestionOutput[];
}
