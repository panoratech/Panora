import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedCollectionInput {
  @ApiProperty({
    description: 'The name of the collection',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the collection',
  })
  description?: string;

  @ApiPropertyOptional({
    description:
      'The type of the collection. Authorized values are either PROJECT or LIST ',
  })
  collection_type?: string;
}

export class UnifiedCollectionOutput extends UnifiedCollectionInput {
  @ApiPropertyOptional({ description: 'The uuid of the collection' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the collection in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the collection in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
