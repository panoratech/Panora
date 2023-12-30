import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedDealInput, UnifiedDealOutput } from './model.unified';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';

export interface IDealService {
  addDeal(
    dealData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDealOutput>>;

  syncDeals(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalDealOutput[]>>;
}

export interface IDealMapper {
  desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDealOutput | OriginalDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDealOutput | UnifiedDealOutput[];
}

export class DealResponse {
  @ApiProperty({ type: [UnifiedDealOutput] })
  deals: UnifiedDealOutput[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
}
