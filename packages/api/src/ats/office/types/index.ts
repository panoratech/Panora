import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedOfficeInput, UnifiedOfficeOutput } from './model.unified';
import { OriginalOfficeOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IOfficeService {
  addOffice(
    officeData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOfficeOutput>>;

  syncOffices(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalOfficeOutput[]>>;
}

export interface IOfficeMapper {
  desunify(
    source: UnifiedOfficeInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalOfficeOutput | OriginalOfficeOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedOfficeOutput | UnifiedOfficeOutput[];
}
