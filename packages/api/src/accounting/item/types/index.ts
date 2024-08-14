import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingItemInput,
  UnifiedAccountingItemOutput,
} from './model.unified';
import { OriginalItemOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IItemService {
  addItem(
    itemData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalItemOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalItemOutput[]>>;
}

export interface IItemMapper {
  desunify(
    source: UnifiedAccountingItemInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalItemOutput | OriginalItemOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingItemOutput | UnifiedAccountingItemOutput[]>;
}
