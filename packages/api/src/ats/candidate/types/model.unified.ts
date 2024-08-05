import { Email, Phone, Url } from '@ats/@lib/@types';
import { UnifiedAtsApplicationOutput } from '@ats/application/types/model.unified';
import { UnifiedAtsAttachmentOutput } from '@ats/attachment/types/model.unified';
import { UnifiedAtsTagOutput } from '@ats/tag/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class UnifiedAtsCandidateInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Joe',
    description: 'The first name of the candidate',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Doe',
    description: 'The last name of the candidate',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Acme',
    description: 'The company of the candidate',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Analyst',
    description: 'The title of the candidate',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'New York',
    description: 'The locations of the candidate',
  })
  @IsString()
  @IsOptional()
  locations?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    description: 'Whether the candidate is private',
  })
  @IsBoolean()
  @IsOptional()
  is_private?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Whether the candidate is reachable by email',
  })
  @IsBoolean()
  @IsOptional()
  email_reachable?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The remote creation date of the candidate',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The remote modification date of the candidate',
  })
  @IsDateString()
  @IsOptional()
  remote_modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The last interaction date with the candidate',
  })
  @IsDateString()
  @IsOptional()
  last_interaction_at?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'The attachments UUIDs of the candidate',
  })
  @IsString({ each: true })
  @IsOptional()
  attachments?: (string | UnifiedAtsAttachmentOutput)[];

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'The applications UUIDs of the candidate',
  })
  @IsString({ each: true })
  @IsOptional()
  applications?: (string | UnifiedAtsApplicationOutput)[];

  @ApiPropertyOptional({
    type: [String],
    example: ['tag_1', 'tag_2'],
    description: 'The tags of the candidate',
  })
  @IsString({ each: true })
  @IsOptional()
  tags?: (string | UnifiedAtsTagOutput)[];

  @ApiPropertyOptional({
    type: [Url],
    example: [
      {
        url: 'mywebsite.com',
        url_type: 'WEBSITE',
      },
    ],
    description:
      'The urls of the candidate, possible values for Url type are WEBSITE, BLOG, LINKEDIN, GITHUB, or OTHER',
  })
  @IsOptional()
  urls?: Url[];

  @ApiPropertyOptional({
    type: [Phone],
    example: [
      {
        phone_number: '+33660688899',
        phone_type: 'WORK',
      },
    ],
    description: 'The phone numbers of the candidate',
  })
  @IsOptional()
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: [Email],
    example: [
      {
        email_address: 'joedoe@gmail.com',
        email_address_type: 'WORK',
      },
    ],
    description: 'The email addresses of the candidate',
  })
  @IsOptional()
  email_addresses?: Email[];

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

export class UnifiedAtsCandidateOutput extends UnifiedAtsCandidateInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The id of the candidate in the context of the 3rd Party',
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
    description:
      'The remote data of the candidate in the context of the 3rd Party',
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

export class UnifiedCandidateUrlInput {
  @ApiPropertyOptional({
    type: String,
    example: 'mywebsite.com',
    description: 'The value of the URL',
  })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'WEBSITE',
    description: 'The type of the URL',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The creation date of the URL',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The modification date of the URL',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidateUrlOutput extends UnifiedCandidateUrlInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the URL',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the URL in the context of the 3rd Party',
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
    description: 'The remote data of the URL in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidatePhoneNumberInput {
  @ApiPropertyOptional({
    type: String,
    example: '+33650009898',
    description: 'The phone number value',
  })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'WORK',
    description: 'The type of phone number',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The creation date of the phone number',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The modification date of the phone number',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidatePhoneNumberOutput extends UnifiedCandidatePhoneNumberInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the phone number',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate_phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description:
      'The remote ID of the phone number in the context of the 3rd Party',
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
    description:
      'The remote data of the phone number in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}

export class UnifiedCandidateEmailAddressInput {
  @ApiPropertyOptional({
    type: String,
    example: 'joedoe@gmail.com',
    description: 'The email address value',
  })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'WORK',
    description: 'The type of email address',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The creation date of the email address',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The modification date of the email address',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate?: string;
}

export class UnifiedCandidateEmailAddressOutput extends UnifiedCandidateEmailAddressInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the email address',
  })
  @IsUUID()
  @IsOptional()
  id_ats_candidate_email_address?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description:
      'The remote ID of the email address in the context of the 3rd Party',
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
    description:
      'The remote data of the email address in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
