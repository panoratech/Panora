import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedTagInput {
  @ApiProperty({
    description: 'The name of the tag',
  })
  name: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the tag between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedTagOutput extends UnifiedTagInput {
  @ApiPropertyOptional({ description: 'The uuid of the tag' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the tag in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description: 'The remote data of the tag in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
