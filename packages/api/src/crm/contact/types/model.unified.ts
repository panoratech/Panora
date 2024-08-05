import { Address, Email, Phone } from '@crm/@lib/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UnifiedCrmContactInput {
  @ApiProperty({
    type: String,
    description: 'The first name of the contact',
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    type: String,
    description: 'The last name of the contact',
    example: 'Doe',
  })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    type: [Email],
    description: 'The email addresses of the contact',
    example: [
      {
        email: 'john.doe@example.com',
        type: 'WORK',
      },
    ],
  })
  @IsOptional()
  @Type(() => Email)
  email_addresses?: Email[];

  @ApiPropertyOptional({
    type: [Phone],
    description: 'The phone numbers of the contact',
    example: [
      {
        phone: '1234567890',
        type: 'WORK',
      },
    ],
  })
  @IsOptional()
  @Type(() => Phone)
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: [Address],
    description: 'The addresses of the contact',
    example: [
      {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA',
        type: 'WORK',
      },
    ],
  })
  @IsOptional()
  @Type(() => Address)
  addresses?: Address[];

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the user who owns the contact',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmContactOutput extends UnifiedCrmContactInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the contact',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The id of the contact in the context of the Crm 3rd Party',
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
      'The remote data of the contact in the context of the Crm 3rd Party',
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
