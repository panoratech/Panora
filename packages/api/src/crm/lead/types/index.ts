import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedLeadInput, UnifiedLeadOutput } from './model.unified';
import { OriginalLeadOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface ILeadService {
  addLead(
    leadData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalLeadOutput>>;

  syncLeads(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalLeadOutput[]>>;
}

export interface ILeadMapper {
  desunify(
    source: UnifiedLeadInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalLeadOutput | OriginalLeadOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedLeadOutput | UnifiedLeadOutput[];
}
