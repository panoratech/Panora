import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedUserInput {
  name?: string;
  email?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the user between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedUserOutput extends UnifiedUserInput {
  @ApiPropertyOptional({ description: 'The uuid of the user' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the user in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the user in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
