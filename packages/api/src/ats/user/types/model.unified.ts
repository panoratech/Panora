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

export class UnifiedAtsUserInput {
  @ApiPropertyOptional({
    type: String,
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Doe',
    description: 'The last name of the user',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    description: 'Whether the user is disabled',
  })
  @IsBoolean()
  @IsOptional()
  disabled?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: 'ADMIN',
    enum: [
      'SUPER_ADMIN',
      'ADMIN',
      'TEAM_MEMBER',
      'LIMITED_TEAM_MEMBER',
      'INTERVIEWER',
    ],
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
    example: '2024-10-01T12:00:00Z',
    description: 'The remote creation date of the user',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The remote modification date of the user',
  })
  @IsDateString()
  @IsOptional()
  remote_modified_at?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAtsUserOutput extends UnifiedAtsUserInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the user',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the user in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description: 'The remote data of the user in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
