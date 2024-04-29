import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedTeamInput {
  @ApiProperty({
    description: 'The name of the team',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the team',
  })
  description?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the team between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedTeamOutput extends UnifiedTeamInput {
  @ApiPropertyOptional({ description: 'The uuid of the team' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the team in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description: 'The remote data of the team in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
