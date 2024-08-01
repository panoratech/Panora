import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingContactInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the contact',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The email address of the contact',
  })
  @IsString()
  email_address: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The phone number of the contact',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The details of the contact',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTicketingContactOutput extends UnifiedTicketingContactInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the contact' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the contact in the context of the 3rd Party',
  })
  @IsOptional()
  @IsString()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the contact in the context of the 3rd Party',
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
