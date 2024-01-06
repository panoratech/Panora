export class UnifiedUserInput {
  name: string;
  email_address: string;
  teams?: string[];
  field_mappings?: Record<string, any>[];
}

export class UnifiedUserOutput extends UnifiedUserInput {
  id?: string;
  remote_id?: string;
}
