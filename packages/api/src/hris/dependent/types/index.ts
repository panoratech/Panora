import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedHrisDependentInput, UnifiedHrisDependentOutput } from './model.unified';
import { OriginalDependentOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IDependentService {
  addDependent(
    dependentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDependentOutput>>;

  syncDependents(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalDependentOutput[]>>;
}

export interface IDependentMapper {
  desunify(
    source: UnifiedHrisDependentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDependentOutput | OriginalDependentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisDependentOutput | UnifiedHrisDependentOutput[]>;
}
