import { UnifiedCrmContactInput, UnifiedCrmContactOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
export interface IContactService extends IBaseObjectService {
  addContact(
    contactData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalContactOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalContactOutput[]>>;
}

export interface IContactMapper {
  desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalContactOutput | OriginalContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmContactOutput | UnifiedCrmContactOutput[]>;
}
