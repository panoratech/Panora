import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedTicketingCollectionInput,
  UnifiedTicketingCollectionOutput,
} from './model.unified';
import {
  OriginalCollectionOutput,
  OriginalCollectionInput,
} from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ICollectionService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalCollectionOutput[]>>;
}

export interface ICollectionMapper {
  desunify(
    source: UnifiedTicketingCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCollectionOutput | OriginalCollectionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingCollectionOutput | UnifiedTicketingCollectionOutput[];
}
