import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export type EeocsRace =
  | 'AMERICAN_INDIAN_OR_ALASKAN_NATIVE'
  | 'ASIAN'
  | 'BLACK_OR_AFRICAN_AMERICAN'
  | 'HISPANIC_OR_LATINO'
  | 'WHITE'
  | 'NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER'
  | 'TWO_OR_MORE_RACES'
  | 'DECLINE_TO_SELF_IDENTIFY';

export type EeocsDisabilityStatus =
  | 'YES_I_HAVE_A_DISABILITY_OR_PREVIOUSLY_HAD_A_DISABILITY'
  | 'NO_I_DONT_HAVE_A_DISABILITY'
  | 'I_DONT_WISH_TO_ANSWER';

export type EeocsGender =
  | 'MALE'
  | 'FEMALE'
  | 'NON_BINARY'
  | 'OTHER'
  | 'DECLINE_TO_SELF_IDENTIFY';

export type EeocsVeteranStatus =
  | 'I_AM_NOT_A_PROTECTED_VETERAN'
  | 'I_IDENTIFY_AS_ONE_OR_MORE_OF_THE_CLASSIFICATIONS_OF_A_PROTECTED_VETERAN'
  | 'I_DONT_WISH_TO_ANSWER';

export class UnifiedAtsEeocsInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  candidate_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    description: 'The submission date of the EEOC',
  })
  @IsDateString()
  @IsOptional()
  submitted_at?: string;

  @ApiPropertyOptional({
    type: String,
    enum: [
      'AMERICAN_INDIAN_OR_ALASKAN_NATIVE',
      'ASIAN',
      'BLACK_OR_AFRICAN_AMERICAN',
      'HISPANIC_OR_LATINO',
      'WHITE',
      'NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER',
      'TWO_OR_MORE_RACES',
      'DECLINE_TO_SELF_IDENTIFY',
    ],
    example: 'AMERICAN_INDIAN_OR_ALASKAN_NATIVE',
    description: 'The race of the candidate',
  })
  @IsIn([
    'AMERICAN_INDIAN_OR_ALASKAN_NATIVE',
    'ASIAN',
    'BLACK_OR_AFRICAN_AMERICAN',
    'HISPANIC_OR_LATINO',
    'WHITE',
    'NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER',
    'TWO_OR_MORE_RACES',
    'DECLINE_TO_SELF_IDENTIFY',
  ])
  @IsOptional()
  race?: EeocsRace | string;

  @ApiPropertyOptional({
    type: String,
    example: 'MALE',
    enum: ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'DECLINE_TO_SELF_IDENTIFY'],
    description: 'The gender of the candidate',
  })
  @IsIn(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'DECLINE_TO_SELF_IDENTIFY'])
  @IsOptional()
  gender?: EeocsGender | string;

  @ApiPropertyOptional({
    type: String,
    example: 'I_AM_NOT_A_PROTECTED_VETERAN',
    enum: [
      'I_AM_NOT_A_PROTECTED_VETERAN',
      'I_IDENTIFY_AS_ONE_OR_MORE_OF_THE_CLASSIFICATIONS_OF_A_PROTECTED_VETERAN',
      'I_DONT_WISH_TO_ANSWER',
    ],
    description: 'The veteran status of the candidate',
  })
  @IsIn([
    'I_AM_NOT_A_PROTECTED_VETERAN',
    'I_IDENTIFY_AS_ONE_OR_MORE_OF_THE_CLASSIFICATIONS_OF_A_PROTECTED_VETERAN',
    'I_DONT_WISH_TO_ANSWER',
  ])
  @IsOptional()
  veteran_status?: EeocsVeteranStatus | string;

  @ApiPropertyOptional({
    type: String,
    enum: [
      'YES_I_HAVE_A_DISABILITY_OR_PREVIOUSLY_HAD_A_DISABILITY',
      'NO_I_DONT_HAVE_A_DISABILITY',
      'I_DONT_WISH_TO_ANSWER',
    ],
    example: 'YES_I_HAVE_A_DISABILITY_OR_PREVIOUSLY_HAD_A_DISABILITY',
    description: 'The disability status of the candidate',
  })
  @IsIn([
    'YES_I_HAVE_A_DISABILITY_OR_PREVIOUSLY_HAD_A_DISABILITY',
    'NO_I_DONT_HAVE_A_DISABILITY',
    'I_DONT_WISH_TO_ANSWER',
  ])
  @IsOptional()
  disability_status?: EeocsDisabilityStatus | string;

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

export class UnifiedAtsEeocsOutput extends UnifiedAtsEeocsInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the EEOC',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the EEOC in the context of the 3rd Party',
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
    description: 'The remote data of the EEOC in the context of the 3rd Party',
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
