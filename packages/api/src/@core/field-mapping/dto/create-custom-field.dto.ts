import { StandardObject } from '@@core/utils/types';
import { CrmObject } from '@crm/@lib/@types';
import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldCreateDto {
  @ApiProperty({
    type: String,
    example: 'company',
    enum: CrmObject,
    nullable: true,
  })
  object_type_owner: StandardObject;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'my_favorite_dish',
    description: 'The name of the custom field',
  })
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Favorite Dish',
    description: 'The description of the custom field',
  })
  description: string;

  @ApiProperty({
    type: String,
    example: 'string',
    nullable: true,
    enum: ['string', 'number'],
    description: 'The data type of the custom field',
  })
  data_type: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'id_1',
    description: 'The source custom field ID',
  })
  source_custom_field_id: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'hubspot',
    description: 'The name of the source software/provider',
  })
  source_provider: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The linked user ID',
  })
  linked_user_id: string;
}
export class DefineTargetFieldDto {
  @ApiProperty({
    type: String,
    example: 'company',
    enum: CrmObject,
    nullable: true,
  })
  object_type_owner: StandardObject;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'fav_dish',
    description: 'The name of the target field',
  })
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'My favorite dish',
    description: 'The description of the target field',
  })
  description: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'string',
    enum: ['string', 'number'],
    description: 'The data type of the target field',
  })
  data_type: string;
}

export class MapFieldToProviderDto {
  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The attribute ID',
  })
  attributeId: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'id_1',
    description: 'The source custom field ID',
  })
  source_custom_field_id: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'hubspot',
    description: 'The source provider',
  })
  source_provider: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The linked user ID',
  })
  linked_user_id: string;
}

export class CustomFieldResponse {
  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'Attribute Id',
  })
  id_attribute: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '',
    description: 'Attribute Status',
  })
  status: string;

  @ApiProperty({
    type: String,
    example: '',
    nullable: true,
    description: 'Attribute Ressource Owner Type',
  })
  ressource_owner_type: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'fav_dish',
    description: 'Attribute Slug',
  })
  slug: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'My favorite dish',
    description: 'Attribute Description',
  })
  description: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'string',
    enum: ['string', 'number'],
    description: 'Attribute Data Type',
  })
  data_type: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'id_1',
    description: 'Attribute Remote Id',
  })
  remote_id: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'hubspot',
    description: 'Attribute Source',
  })
  source: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'Attribute Entity Id',
  })
  id_entity: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'Attribute Project Id',
  })
  id_project: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '',
    description: 'Attribute Scope',
  })
  scope: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'Attribute Consumer Id',
  })
  id_consumer: string;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'Attribute Created Date',
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'Attribute Modified Date',
  })
  modified_at: Date;
}
