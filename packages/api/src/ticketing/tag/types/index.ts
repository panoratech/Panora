import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTagInput, UnifiedTagOutput } from './model.unified';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';

export interface ITagService {
  syncTags(
    linkedUserId: string,
    id_ticket: string,
  ): Promise<ApiResponse<OriginalTagOutput[]>>;
}

export interface ITagMapper {
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTagOutput | OriginalTagOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[];
}

export class TagResponse {
  @ApiProperty({ type: [UnifiedTagOutput] })
  tags: UnifiedTagOutput[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
}
