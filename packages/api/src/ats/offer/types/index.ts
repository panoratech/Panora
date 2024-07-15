import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedOfferInput, UnifiedOfferOutput } from './model.unified';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IOfferService extends IBaseObjectService {
  addOffer(
    offerData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOfferOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalOfferOutput[]>>;
}

export interface IOfferMapper {
  desunify(
    source: UnifiedOfferInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalOfferOutput | OriginalOfferOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfferOutput | UnifiedOfferOutput[]>;
}
