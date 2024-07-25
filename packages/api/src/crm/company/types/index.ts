import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCrmCompanyInput, UnifiedCrmCompanyOutput } from './model.unified';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ICompanyService extends IBaseObjectService {
  addCompany(
    companyData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCompanyOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalCompanyOutput[]>>;
}

export interface ICompanyMapper {
  desunify(
    source: UnifiedCrmCompanyInput,
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
  ): Promise<UnifiedCrmCompanyOutput | UnifiedCrmCompanyOutput[]>;
}
