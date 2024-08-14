import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisEmployerbenefitInput,
  UnifiedHrisEmployerbenefitOutput,
} from './model.unified';
import { OriginalEmployerBenefitOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IEmployerBenefitService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalEmployerBenefitOutput[]>>;
}

export interface IEmployerBenefitMapper {
  desunify(
    source: UnifiedHrisEmployerbenefitInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmployerBenefitOutput | OriginalEmployerBenefitOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedHrisEmployerbenefitOutput | UnifiedHrisEmployerbenefitOutput[]
  >;
}
