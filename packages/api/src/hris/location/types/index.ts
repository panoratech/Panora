import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisLocationInput,
  UnifiedHrisLocationOutput,
} from './model.unified';
import { OriginalLocationOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface ILocationService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalLocationOutput[]>>;
}

export interface ILocationMapper {
  desunify(
    source: UnifiedHrisLocationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalLocationOutput | OriginalLocationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisLocationOutput | UnifiedHrisLocationOutput[]>;
}
