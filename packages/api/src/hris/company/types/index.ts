import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisCompanyInput,
  UnifiedHrisCompanyOutput,
} from './model.unified';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface ICompanyService {
  addCompany(
    companyData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCompanyOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalCompanyOutput[]>>;
}

export interface ICompanyMapper {
  desunify(
    source: UnifiedHrisCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCompanyOutput | OriginalCompanyOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisCompanyOutput | UnifiedHrisCompanyOutput[]>;
}
