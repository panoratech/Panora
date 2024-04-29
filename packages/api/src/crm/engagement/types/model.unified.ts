import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedEngagementInput {
  @ApiPropertyOptional({ description: 'The content of the engagement' })
  content?: string;

  @ApiPropertyOptional({ description: 'The direction of the engagement' })
  direction?: string;

  @ApiPropertyOptional({ description: 'The subject of the engagement' })
  subject?: string;

  @ApiPropertyOptional({ description: 'The start time of the engagement' })
  start_at?: Date;

  @ApiPropertyOptional({ description: 'The end time of the engagement' })
  end_time?: Date;

  @ApiProperty({
    description:
      'The type of the engagement. Authorized values are EMAIL, CALL or MEETING',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'The uuid of the user tied to the engagement',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid of the company tied to the engagement',
  })
  company_id?: string; // uuid of Company object

  @ApiPropertyOptional({
    description: 'The uuids of contacts tied to the engagement object',
  })
  contacts?: string[]; // array of uuids of Engagement Contacts objects

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the engagement between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
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
