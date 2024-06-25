import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTemplateInput, UnifiedTemplateOutput } from './model.unified';
import { OriginalTemplateOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface ITemplateService {
  addTemplate(
    templateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTemplateOutput>>;

  syncTemplates(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTemplateOutput[]>>;
}

export interface ITemplateMapper {
  desunify(
    source: UnifiedTemplateInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTemplateOutput | OriginalTemplateOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTemplateOutput | UnifiedTemplateOutput[]>;
}
