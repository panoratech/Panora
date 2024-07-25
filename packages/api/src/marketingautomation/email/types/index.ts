import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedMarketingautomationEmailInput, UnifiedMarketingautomationEmailOutput } from './model.unified';
import { OriginalEmailOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IEmailService {
  addEmail(
    emailData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEmailOutput>>;

  syncEmails(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEmailOutput[]>>;
}

export interface IEmailMapper {
  desunify(
    source: UnifiedMarketingautomationEmailInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmailOutput | OriginalEmailOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedMarketingautomationEmailOutput | UnifiedMarketingautomationEmailOutput[]>;
}
