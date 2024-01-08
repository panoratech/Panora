export class UnifiedTagInput {
  name: string;
  field_mappings?: Record<string, any>[];
}

export class UnifiedTagOutput extends UnifiedTagInput {
  id?: string;
  remote_id?: string;
  remote_data?: Record<string, any>;
}
