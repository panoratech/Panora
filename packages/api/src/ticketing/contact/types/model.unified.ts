import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedContactInput {
  @ApiProperty({
    type: String,
    description: 'The name of the contact',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The email address of the contact',
  })
  @IsString()
  email_address: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The phone number of the contact',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The details of the contact',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the contact' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the contact in the context of the 3rd Party',
  })
  @IsOptional()
  @IsString()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the contact in the context of the 3rd Party',
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
