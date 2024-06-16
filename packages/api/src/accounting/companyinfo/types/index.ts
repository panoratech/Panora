import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCompanyinfoInput, UnifiedCompanyinfoOutput } from './model.unified';
import { OriginalCompanyinfoOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICompanyinfoService {
  addCompanyinfo(
    companyinfoData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCompanyinfoOutput>>;

  syncCompanyinfos(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCompanyinfoOutput[]>>;
}

export interface ICompanyinfoMapper {
  desunify(
    source: UnifiedCompanyinfoInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCompanyinfoOutput | OriginalCompanyinfoOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyinfoOutput | UnifiedCompanyinfoOutput[];
}
