import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UnifiedNoteInput {
  @ApiProperty({ type: String, description: 'The content of the note' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the user tied the note',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the company tied to the note',
  })
  @IsString()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid fo the contact tied to the note',
  })
  @IsString()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the deal tied to the note',
  })
  @IsString()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the note between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedNoteOutput extends UnifiedNoteInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the note' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,

    description: 'The id of the note in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the note in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
