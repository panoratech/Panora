import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisEmploymentInput,
  UnifiedHrisEmploymentOutput,
} from './model.unified';
import { OriginalEmploymentOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IEmploymentService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalEmploymentOutput[]>>;
}

export interface IEmploymentMapper {
  desunify(
    source: UnifiedHrisEmploymentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmploymentOutput | OriginalEmploymentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisEmploymentOutput | UnifiedHrisEmploymentOutput[]>;
}
