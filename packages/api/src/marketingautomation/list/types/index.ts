import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedListInput, UnifiedListOutput } from './model.unified';
import { OriginalListOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IListService {
  addList(
    listData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalListOutput>>;

  syncLists(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalListOutput[]>>;
}

export interface IListMapper {
  desunify(
    source: UnifiedListInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalListOutput | OriginalListOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedListOutput | UnifiedListOutput[]>;
}
