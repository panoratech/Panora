import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedTaskInput {
  @ApiProperty({ description: 'The subject of the task' })
  subject: string;

  @ApiProperty({ description: 'The content of the task' })
  content: string;

  @ApiProperty({
    description:
      'The status of the task. Authorized values are PENDING, COMPLETED.',
  })
  status: string;

  @ApiPropertyOptional({ description: 'The due date of the task' })
  due_date?: Date;

  @ApiPropertyOptional({ description: 'The finished date of the task' })
  finished_date?: Date;

  @ApiPropertyOptional({ description: 'The uuid of the user tied to the task' })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid fo the company tied to the task',
  })
  company_id?: string;

  @ApiPropertyOptional({ description: 'The uuid of the deal tied to the task' })
  deal_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the task between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedTaskOutput extends UnifiedTaskInput {
  @ApiPropertyOptional({ description: 'The uuid of the task' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the task in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the task in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
