export class UnifiedAccountInput {
  name: string;
  domains: string[];
  field_mappings?: Record<string, any>[];
}

export class UnifiedAccountOutput extends UnifiedAccountInput {
  id?: string;
  remote_id?: string;
}
