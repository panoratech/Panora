import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountInput, UnifiedAccountOutput } from './model.unified';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';

export interface IAccountService {
  syncAccounts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAccountOutput[]>>;
}

export interface IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAccountOutput | OriginalAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[];
}

export class AccountResponse {
  @ApiProperty({ type: [UnifiedAccountOutput] })
  accounts: UnifiedAccountOutput[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
}
