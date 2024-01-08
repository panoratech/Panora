export class UnifiedContactInput {
  name: string;
  email_address: string;
  phone_number?: string;
  details?: string;
  field_mappings?: Record<string, any>[];
}

export class UnifiedContactOutput extends UnifiedContactInput {
  id?: string;
  remote_id?: string;
  remote_data?: Record<string, any>;
}
