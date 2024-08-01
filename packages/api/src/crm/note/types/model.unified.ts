import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCrmNoteInput {
  @ApiProperty({
    type: String,
    description: 'The content of the note',
    nullable: true,
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the user tied the note',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the company tied to the note',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID fo the contact tied to the note',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the deal tied to the note',
  })
  @IsUUID()
  @IsOptional()
  deal_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    description:
      'The custom field mappings of the note between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmNoteOutput extends UnifiedCrmNoteInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the note',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the note in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the note in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
