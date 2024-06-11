import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedUserInput, UnifiedUserOutput } from './model.unified';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';

export interface IUserService {
  syncUsers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalUserOutput[]>>;

  syncUser(
    linkedUserId: string,
    remote_id: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalUserOutput[]>>;
}

export interface IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalUserOutput | OriginalUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[];
}
