import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedOfferInput, UnifiedOfferOutput } from './model.unified';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IOfferService {
  addOffer(
    offerData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOfferOutput>>;

  syncOffers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalOfferOutput[]>>;
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedOfferOutput | UnifiedOfferOutput[];
}
