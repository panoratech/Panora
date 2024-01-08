import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedAccountInput {
  @ApiProperty({ description: 'The name of the account' })
  name: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The domains of the account',
  })
  domains?: string[];

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the account between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedAccountOutput extends UnifiedAccountInput {
  @ApiPropertyOptional({ description: 'The uuid of the account' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the account in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the account in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
