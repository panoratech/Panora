import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedUserInput, UnifiedUserOutput } from './model.unified';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IUserService extends IBaseObjectService {
  addUser(
    userData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalUserOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalUserOutput[]>>;
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
