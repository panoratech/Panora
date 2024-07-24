import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedMarketingautomationActionInput, UnifiedMarketingautomationActionOutput } from './model.unified';
import { OriginalActionOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IActionService {
  addAction(
    actionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalActionOutput>>;

  syncActions(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalActionOutput[]>>;
}

export interface IActionMapper {
  desunify(
    source: UnifiedMarketingautomationActionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalActionOutput | OriginalActionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedMarketingautomationActionOutput | UnifiedMarketingautomationActionOutput[]>;
}
