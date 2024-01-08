import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedContactInput {
  @ApiProperty({
    description: 'The name of the contact',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the contact',
  })
  email_address: string;

  @ApiPropertyOptional({
    description: 'The phone number of the contact',
  })
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'The details of the contact',
  })
  details?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional({ description: 'The uuid of the contact' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the contact in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the contact in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
