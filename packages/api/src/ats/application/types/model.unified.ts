import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from 'class-validator';

export class UnifiedAtsApplicationInput {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The application date',
    example: '2024-10-01T12:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  applied_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The rejection date',
    example: '2024-10-01T12:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  rejected_at?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The offers UUIDs for the application',
    example: [
      '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
      '12345678-1234-1234-1234-123456789012',
    ],
  })
  @IsArray()
  @IsOptional()
  offers?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'The source of the application',
    example: 'Source Name',
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the person credited for the application',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  credited_to?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the current stage of the application',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  current_stage?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The rejection reason for the application',
    example: 'Candidate not experienced enough',
  })
  @IsString()
  @IsOptional()
  reject_reason?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  candidate_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the job',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  job_id?: string;

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

export class UnifiedAtsApplicationOutput extends UnifiedAtsApplicationInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the application',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the application in the context of the 3rd Party',
    example: 'id_1',
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
      'The remote data of the application in the context of the 3rd Party',
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

  remote_created_at: string;
  remote_modified_at: string;
}
