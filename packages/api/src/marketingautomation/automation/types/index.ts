import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedMarketingautomationAutomationInput,
  UnifiedMarketingautomationAutomationOutput,
} from './model.unified';
import { OriginalAutomationOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IAutomationService {
  addAutomation(
    automationData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAutomationOutput>>;

  syncAutomations(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAutomationOutput[]>>;
}

export interface IAutomationMapper {
  desunify(
    source: UnifiedMarketingautomationAutomationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAutomationOutput | OriginalAutomationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedMarketingautomationAutomationOutput | UnifiedMarketingautomationAutomationOutput[]>;
}
