import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingAddressInput,
  UnifiedAccountingAddressOutput,
} from './model.unified';
import { OriginalAddressOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IAddressService {
  addAddress(
    addressData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAddressOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalAddressOutput[]>>;
}

export interface IAddressMapper {
  desunify(
    source: UnifiedAccountingAddressInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAddressOutput | OriginalAddressOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingAddressOutput | UnifiedAccountingAddressOutput[]>;
}
