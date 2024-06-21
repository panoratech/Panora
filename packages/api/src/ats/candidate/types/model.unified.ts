import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class UnifiedCandidateInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The first name of the candidate',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The last name of the candidate',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The company of the candidate',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The title of the candidate',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The locations of the candidate',
  })
  @IsString()
  @IsOptional()
  locations?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the candidate is private',
  })
  @IsBoolean()
  @IsOptional()
  is_private?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the candidate is reachable by email',
  })
  @IsBoolean()
  @IsOptional()
  email_reachable?: boolean;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote creation date of the candidate',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote modification date of the candidate',
  })
  @IsDateString()
  @IsOptional()
  remote_modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The last interaction date with the candidate',
  })
  @IsDateString()
  @IsOptional()
  last_interaction_at?: string;
}

export class UnifiedCandidateOutput extends UnifiedCandidateInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the candidate in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the candidate in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidateTagInput {
  @ApiPropertyOptional({ type: String, description: 'The name of the tag' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The creation date of the tag',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The modification date of the tag',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}

export class UnifiedCandidateTagOutput extends UnifiedCandidateTagInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the tag' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the tag in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the tag in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidateUrlInput {
  @ApiPropertyOptional({ type: String, description: 'The value of the URL' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ type: String, description: 'The type of the URL' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The creation date of the URL',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The modification date of the URL',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidateUrlOutput extends UnifiedCandidateUrlInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the URL' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the URL in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the URL in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidatePhoneNumberInput {
  @ApiPropertyOptional({ type: String, description: 'The phone number value' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The type of phone number',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The creation date of the phone number',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The modification date of the phone number',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidatePhoneNumberOutput extends UnifiedCandidatePhoneNumberInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the phone number',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate_phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the phone number in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the phone number in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidateEmailAddressInput {
  @ApiPropertyOptional({ type: String, description: 'The email address value' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The type of email address',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The creation date of the email address',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The modification date of the email address',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidateEmailAddressOutput extends UnifiedCandidateEmailAddressInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the email address',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate_email_address?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the email address in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the email address in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
