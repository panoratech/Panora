import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedStageInput {
  @ApiProperty({ description: 'The name of the stage' })
  stage_name: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the stage between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedStageOutput extends UnifiedStageInput {
  @ApiPropertyOptional({ description: 'The uuid of the stage' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the stage in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the stage in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
