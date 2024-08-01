import { StandardObject } from '@@core/utils/types';
import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldCreateDto {
  @ApiProperty({ type: String, nullable: true })
  object_type_owner: StandardObject;
  @ApiProperty({ type: String, nullable: true })
  name: string;
  @ApiProperty({ type: String, nullable: true })
  description: string;
  @ApiProperty({ type: String, nullable: true })
  data_type: string;
  @ApiProperty({ type: String, nullable: true })
  source_custom_field_id: string;
  @ApiProperty({ type: String, nullable: true })
  source_provider: string;
  @ApiProperty({ type: String, nullable: true })
  linked_user_id: string;
}
export class DefineTargetFieldDto {
  @ApiProperty({ type: String, nullable: true })
  object_type_owner: StandardObject;
  @ApiProperty({ type: String, nullable: true })
  name: string;
  @ApiProperty({ type: String, nullable: true })
  description: string;
  @ApiProperty({ type: String, nullable: true })
  data_type: string;
}

export class MapFieldToProviderDto {
  @ApiProperty({ type: String, nullable: true, description: 'Attribute Id' })
  attributeId: string;
  @ApiProperty({ type: String, nullable: true, description: 'Attribute Id' })
  source_custom_field_id: string;
  @ApiProperty({ type: String, nullable: true, description: 'Attribute Id' })
  source_provider: string;
  @ApiProperty({ type: String, nullable: true, description: 'Attribute Id' })
  linked_user_id: string;
}

export class CustomFieldResponse {
  @ApiProperty({ type: String, nullable: true, description: 'Attribute Id' })
  id_attribute: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Status',
  })
  status: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Ressource Owner Type',
  })
  ressource_owner_type: string;

  @ApiProperty({ type: String, nullable: true, description: 'Attribute Slug' })
  slug: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Description',
  })
  description: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Data Type',
  })
  data_type: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Remote Id',
  })
  remote_id: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Source',
  })
  source: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Id Entity',
  })
  id_entity: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Id Project',
  })
  id_project: string;

  @ApiProperty({ type: String, nullable: true, description: 'Attribute Scope' })
  scope: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Attribute Id Consumer',
  })
  id_consumer: string;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Attribute Created Date',
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Attribute Modified Date',
  })
  modified_at: Date;
}
