import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedScreeningQuestionInput, UnifiedScreeningQuestionOutput } from './model.unified';
import { OriginalScreeningQuestionOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IScreeningQuestionService {
  addScreeningQuestion(
    screeningquestionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalScreeningQuestionOutput>>;

  syncScreeningQuestions(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalScreeningQuestionOutput[]>>;
}

export interface IScreeningQuestionMapper {
  desunify(
    source: UnifiedScreeningQuestionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalScreeningQuestionOutput | OriginalScreeningQuestionOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedScreeningQuestionOutput | UnifiedScreeningQuestionOutput[];
}
