import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCompanyInput, UnifiedCompanyOutput } from './model.unified';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface ICompanyService {
  addCompany(
    companyData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCompanyOutput>>;

  syncCompanys(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCompanyOutput[]>>;
}

export interface ICompanyMapper {
  desunify(
    source: UnifiedCompanyInput,
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
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]>;
}
