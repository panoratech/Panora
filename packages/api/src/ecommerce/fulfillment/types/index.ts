import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEcommerceFulfilmentInput,
  UnifiedEcommerceFulfilmentOutput,
} from './model.unified';
import { OriginalFulfillmentOutput } from '@@core/utils/types/original/original.ecommerce';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IFulfillmentService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalFulfillmentOutput[]>>;
}

export interface IFulfillmentMapper {
  desunify(
    source: UnifiedEcommerceFulfilmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFulfillmentOutput | OriginalFulfillmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedEcommerceFulfilmentOutput | UnifiedEcommerceFulfilmentOutput[]
  >;
}
