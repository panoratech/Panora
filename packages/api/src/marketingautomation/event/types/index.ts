import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedEventInput, UnifiedEventOutput } from './model.unified';
import { OriginalEventOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface IEventService {
  addEvent(
    eventData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEventOutput>>;

  syncEvents(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEventOutput[]>>;
}

export interface IEventMapper {
  desunify(
    source: UnifiedEventInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEventOutput | OriginalEventOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEventOutput | UnifiedEventOutput[]>;
}
