import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedOfficeInput, UnifiedOfficeOutput } from './model.unified';
import { OriginalOfficeOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IOfficeService extends IBaseObjectService {
  addOffice(
    officeData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOfficeOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalOfficeOutput[]>>;
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfficeOutput | UnifiedOfficeOutput[]>;
}
