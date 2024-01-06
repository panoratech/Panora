export class UnifiedTeamInput {
  name: string;
  description?: string;
  field_mappings?: Record<string, any>[];
}

export class UnifiedTeamOutput extends UnifiedTeamInput {
  id?: string;
  remote_id?: string;
}
