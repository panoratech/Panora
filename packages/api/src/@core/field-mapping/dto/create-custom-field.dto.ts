import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldCreateDto {
  @ApiProperty({
    type: String,
    example: 'my_favorite_dish',
    description: 'The name of the custom field',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'Favorite Dish',
    description: 'The description of the custom field',
  })
  description: string;

  @ApiProperty({
    type: String,
    example: 'string',
    enum: ['string', 'number'],
    description: 'The data type of the custom field',
  })
  data_type: string;

  @ApiProperty({
    type: String,
    example: 'id_1',
    description: 'The source custom field ID',
  })
  source_custom_field_id: string;

  @ApiProperty({
    type: String,
    example: 'hubspot',
    description: 'The name of the source software/provider',
  })
  source_provider: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The linked user ID',
  })
  linked_user_id: string;
}
export class DefineTargetFieldDto {
  @ApiProperty({
    type: String,
    example: 'fav_dish',
    description: 'The name of the target field',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'My favorite dish',
    description: 'The description of the target field',
  })
  description: string;

  @ApiProperty({
    type: String,
    example: 'string',
    enum: ['string', 'number'],
    description: 'The data type of the target field',
  })
  data_type: string;
}

export class MapFieldToProviderDto {
  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The attribute ID',
  })
  attributeId: string;

  @ApiProperty({
    type: String,
    example: 'id_1',
    description: 'The source custom field ID',
  })
  source_custom_field_id: string;

  @ApiProperty({
    type: String,
    example: 'hubspot',
    description: 'The source provider',
  })
  source_provider: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The linked user ID',
  })
  linked_user_id: string;
}
