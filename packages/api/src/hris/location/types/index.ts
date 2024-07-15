import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedLocationInput, UnifiedLocationOutput } from './model.unified';
import { OriginalLocationOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface ILocationService {
  addLocation(
    locationData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalLocationOutput>>;

  syncLocations(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalLocationOutput[]>>;
}

export interface ILocationMapper {
  desunify(
    source: UnifiedLocationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalLocationOutput | OriginalLocationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedLocationOutput | UnifiedLocationOutput[]>;
}
