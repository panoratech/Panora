import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedUserInput, UnifiedUserOutput } from './model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ticketing';

export interface IUserService {
  addUser(
    userData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalUserOutput>>;

  syncUsers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalUserOutput[]>>;
}

export interface IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalUserOutput | OriginalUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[];
}

export class UserResponse {
  @ApiProperty({ type: [UnifiedUserOutput] })
  users: UnifiedUserOutput[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
}
