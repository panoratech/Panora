import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsIn,
} from 'class-validator';

export type UserAccessRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEAM_MEMBER'
  | 'LIMITED_TEAM_MEMBER'
  | 'INTERVIEWER';

export class UnifiedUserInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The first name of the user',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The last name of the user',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ type: String, description: 'The email of the user' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the user is disabled',
  })
  @IsBoolean()
  @IsOptional()
  disabled?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'The access role of the user',
  })
  @IsIn([
    'SUPER_ADMIN',
    'ADMIN',
    'TEAM_MEMBER',
    'LIMITED_TEAM_MEMBER',
    'INTERVIEWER',
  ])
  @IsOptional()
  access_role?: UserAccessRole | string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote creation date of the user',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote modification date of the user',
  })
  @IsDateString()
  @IsOptional()
  remote_modified_at?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedUserOutput extends UnifiedUserInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the user' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the user in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the user in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
