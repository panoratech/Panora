import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTicketingTagInput, UnifiedTicketingTagOutput } from './model.unified';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ITagService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalTagOutput[]>>;
}

export interface ITagMapper {
  desunify(
    source: UnifiedTicketingTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTagOutput | OriginalTagOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTagOutput | UnifiedTicketingTagOutput[];
}
