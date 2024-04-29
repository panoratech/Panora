import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedUserInput {
  @ApiProperty({
    description: 'The name of the user',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
  })
  email_address: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The teams whose the user is part of',
  })
  teams?: string[];

  //TODO
  @ApiPropertyOptional({
    type: [String],
    description: 'The account or organization the user is part of',
  })
  account_id?: string[];

  @ApiProperty({
    type: {},
    description:
      'The custom field mappings of the user between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedUserOutput extends UnifiedUserInput {
  @ApiPropertyOptional({ description: 'The uuid of the user' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the user in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description: 'The remote data of the user in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
