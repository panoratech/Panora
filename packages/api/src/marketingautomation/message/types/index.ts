import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedMarketingautomationMessageInput, UnifiedMarketingautomationMessageOutput } from './model.unified';
import { OriginalMessageOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IMessageService {
  addMessage(
    messageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalMessageOutput>>;

  syncMessages(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalMessageOutput[]>>;
}

export interface IMessageMapper {
  desunify(
    source: UnifiedMarketingautomationMessageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalMessageOutput | OriginalMessageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedMarketingautomationMessageOutput | UnifiedMarketingautomationMessageOutput[]>;
}
