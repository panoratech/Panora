import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedTicketingContactInput {
  @ApiProperty({
    type: String,
    example: 'Joe',
    description: 'The name of the contact',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: 'joedoe@acme.org',
    description: 'The email address of the contact',
  })
  @IsString()
  email_address: string;

  @ApiPropertyOptional({
    type: String,
    example: '+33 6 50 11 11 10',
    description: 'The phone number of the contact',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Contact Details',
    description: 'The details of the contact',
  })
  @IsOptional()
  @IsString()
  details?: string;

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

export class UnifiedTicketingContactOutput extends UnifiedTicketingContactInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the contact',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the contact in the context of the 3rd Party',
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
      'The remote data of the contact in the context of the 3rd Party',
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
