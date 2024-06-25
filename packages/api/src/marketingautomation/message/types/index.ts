import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedMessageInput, UnifiedMessageOutput } from './model.unified';
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
    source: UnifiedMessageInput,
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
  ): Promise<UnifiedMessageOutput | UnifiedMessageOutput[]>;
}
