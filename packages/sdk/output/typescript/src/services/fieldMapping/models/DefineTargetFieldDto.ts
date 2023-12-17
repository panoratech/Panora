export interface DefineTargetFieldDto {
  object_type_owner: ObjectTypeOwner;
  name: string;
  description: string;
  data_type: string;
}
interface ObjectTypeOwner {
  [k: string]: unknown;
}
