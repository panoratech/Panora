import { StandardObject } from 'src/@core/utils/types';

export class CustomFieldCreateDto {}

export class DefineTargetFieldDto {
  object_type_owner: StandardObject;
  name: string;
  description: string;
  data_type: string;
}

export class MapFieldToProviderDto {
  attributeId: string;
  source_custom_field_id: string;
  source_provider: string;
  linked_user_id: string;
  data: any;
}
