import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedNoteInput {
  @ApiProperty({ description: 'The content of the note' })
  content: string;

  @ApiPropertyOptional({ description: 'The uuid of the user tied the note' })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid of the company tied to the note',
  })
  company_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid fo the contact tied to the note',
  })
  contact_id?: string;

  @ApiPropertyOptional({ description: 'The uuid of the deal tied to the note' })
  deal_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the note between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
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
