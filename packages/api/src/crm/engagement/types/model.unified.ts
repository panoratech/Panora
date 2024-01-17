import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedEngagementInput {
  content?: string;
  direction?: string;
  subject?: string;
  start_at?: Date;
  end_time?: Date;
  engagement_type?: string; //uuid of Engagemnt Type object
  company_id?: string; // uuid of Company object
  contacts?: string[]; // array of uuids of Engagement Contacts objects
  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the engagement between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}

export class UnifiedEngagementOutput extends UnifiedEngagementInput {
  @ApiPropertyOptional({ description: 'The uuid of the engagement' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the engagement in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the engagement in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
