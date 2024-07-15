import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedUserInput, UnifiedUserOutput } from './model.unified';
import { OriginalUserOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IUserService {
  addUser(
    userData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalUserOutput>>;

  syncUsers(
    linkedUserId: string,
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedUserOutput | UnifiedUserOutput[]>;
}
