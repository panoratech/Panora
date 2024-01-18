import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedNoteInput {
  content: string;
  user_id?: string;
  company_id?: string;
  contact_id?: string;
  deal_id?: string;
  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the note between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedNoteOutput extends UnifiedNoteInput {
  @ApiPropertyOptional({ description: 'The uuid of the note' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the note in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the note in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
