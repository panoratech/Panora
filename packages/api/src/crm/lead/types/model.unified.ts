import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedLeadInput {
  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the lead between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedLeadOutput extends UnifiedLeadInput {
  @ApiPropertyOptional({ description: 'The uuid of the lead' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the lead in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the lead in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
