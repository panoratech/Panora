import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedTaskInput {
  subject?: string;
  content?: string;
  status?: string;
  due_date?: Date;
  finished_date?: Date;
  user_id?: string;
  company_id?: string;
  deal_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the task between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
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
