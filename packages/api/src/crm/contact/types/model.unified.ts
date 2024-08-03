import { Address, Email, Phone } from '@crm/@lib/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UnifiedCrmContactInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The first name of the contact',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The last name of the contact',
  })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    type: [Email],
    nullable: true,
    description: 'The email addresses of the contact',
  })
  @IsOptional()
  @Type(() => Email)
  email_addresses?: Email[];

  @ApiPropertyOptional({
    type: [Phone],
    nullable: true,
    description: 'The phone numbers of the contact',
  })
  @IsOptional()
  @Type(() => Phone)
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: [Address],
    nullable: true,
    description: 'The addresses of the contact',
  })
  @IsOptional()
  @Type(() => Address)
  addresses?: Address[];

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the user who owns the contact',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

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

export class UnifiedCrmContactOutput extends UnifiedCrmContactInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the contact',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the contact in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the contact in the context of the Crm 3rd Party',
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
