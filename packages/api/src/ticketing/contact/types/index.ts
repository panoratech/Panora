import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTicketingContactInput, UnifiedTicketingContactOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.ticketing';
import { SyncParam } from '@@core/utils/types/interface';

export interface IContactService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalContactOutput[]>>;
}

export interface IContactMapper {
  desunify(
    source: UnifiedTicketingContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalContactOutput | OriginalContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingContactOutput | UnifiedTicketingContactOutput[];
}
