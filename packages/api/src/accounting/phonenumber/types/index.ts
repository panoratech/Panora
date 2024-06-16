import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedPhonenumberInput, UnifiedPhonenumberOutput } from './model.unified';
import { OriginalPhonenumberOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IPhonenumberService {
  addPhonenumber(
    phonenumberData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPhonenumberOutput>>;

  syncPhonenumbers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPhonenumberOutput[]>>;
}

export interface IPhonenumberMapper {
  desunify(
    source: UnifiedPhonenumberInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPhonenumberOutput | OriginalPhonenumberOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedPhonenumberOutput | UnifiedPhonenumberOutput[];
}
