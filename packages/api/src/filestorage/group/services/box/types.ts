export interface BoxGroupInput {
  id: string;
  type: 'group';
  name: string;
  group_type: string;
  created_at: string;
  modified_at: string;
  provenance: string;
  external_sync_identifier: string;
  description: string;
  invitability_level: string;
  member_viewability_level: string;
  permissions: {
    can_invite_as_collaborator: boolean;
  };
}

export type BoxGroupOutput = Partial<BoxGroupInput>;
