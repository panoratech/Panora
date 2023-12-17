import { StandardObject } from '@@core/utils/types';
import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldCreateDto {}

export class DefineTargetFieldDto {
  @ApiProperty({ type: String })
  object_type_owner: StandardObject;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  data_type: string;
}

export class MapFieldToProviderDto {
  @ApiProperty()
  attributeId: string;
  @ApiProperty()
  source_custom_field_id: string;
  @ApiProperty()
  source_provider: string;
  @ApiProperty()
  linked_user_id: string;
}
