import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEcommerceFulfillmentOrdersInput,
  UnifiedEcommerceFulfillmentOrdersOutput,
} from './model.unified';
import { OriginalFulfillmentOrdersOutput } from '@@core/utils/types/original/original.ecommerce';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IFulfillmentOrdersService extends IBaseObjectService {
  sync(
    data: SyncParam,
  ): Promise<ApiResponse<OriginalFulfillmentOrdersOutput[]>>;
}

export interface IFulfillmentOrdersMapper {
  desunify(
    source: UnifiedEcommerceFulfillmentOrdersInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFulfillmentOrdersOutput | OriginalFulfillmentOrdersOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceFulfillmentOrdersOutput | UnifiedEcommerceFulfillmentOrdersOutput[]>;
}
