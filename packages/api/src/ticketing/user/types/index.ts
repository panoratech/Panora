import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTicketingUserInput, UnifiedTicketingUserOutput } from './model.unified';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IUserService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalUserOutput[]>>;
}

export interface IUserMapper {
  desunify(
    source: UnifiedTicketingUserInput,
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
  ): Promise<UnifiedTicketingUserOutput | UnifiedTicketingUserOutput[]>;
}
