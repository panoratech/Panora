import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountInput, UnifiedAccountOutput } from './model.unified';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IAccountService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalAccountOutput[]>>;
}

export interface IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAccountOutput | OriginalAccountOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[];
}
