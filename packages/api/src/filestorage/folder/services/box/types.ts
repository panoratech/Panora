export interface BoxFolderInput {
  id: string;
  type: 'folder';
  allowed_invitee_roles: string[];
  allowed_shared_link_access_levels: string[];
  can_non_owners_invite: boolean;
  can_non_owners_view_collaborators: boolean;
  classification: BoxClassification;
  content_created_at: string;
  content_modified_at: string;
  created_at: string;
  created_by: BoxUser;
  description: string;
  etag: string;
  folder_upload_email: BoxFolderUploadEmail;
  has_collaborations: boolean;
  is_accessible_via_shared_link: boolean;
  is_collaboration_restricted_to_enterprise: boolean;
  is_externally_owned: boolean;
  item_collection: BoxItemCollection;
  item_status: string;
  metadata: Record<string, any>;
  modified_at: string;
  modified_by: BoxUser;
  name: string;
  owned_by: BoxUser;
  parent: {
    id: string;
    type: 'folder';
    etag: string;
    name: string;
    sequence_id: string;
  };
  path_collection: {
    entries: {
      id: string;
      etag: string;
      type: 'folder';
      sequence_id: string;
      name: string;
    }[];
    total_count: number;
  };
  permissions: {
    can_delete: boolean;
    can_download: boolean;
    can_invite_collaborator: boolean;
    can_rename: boolean;
    can_set_share_access: boolean;
    can_share: boolean;
    can_upload: boolean;
  };
  purged_at: string | null;
  sequence_id: string;
  shared_link: BoxSharedLink;
  size: number;
  sync_state: string;
  tags: string[];
  trashed_at: string | null;
  watermark_info: {
    is_watermarked: boolean;
  };
}

export type BoxFolderOutput = Partial<BoxFolderInput>;

type BoxUser = {
  id: string;
  type: 'user';
  login: string;
  name: string;
};

type BoxSharedLink = {
  url: string;
  download_url: string;
  vanity_url?: string;
  vanity_name?: string;
  access: string;
  effective_access: string;
  effective_permission: string;
  unshared_at: string;
  is_password_enabled: boolean;
  permissions: {
    can_download: boolean;
    can_preview: boolean;
    can_edit: boolean;
  };
  download_count: number;
  preview_count: number;
} & {
  [key: string]: any;
};

type BoxFolderUploadEmail = {
  access: string;
  email: string;
};

type BoxClassification = {
  color: string;
  definition: string;
  name: string;
};

type BoxItemCollection = {
  entries: BoxItem[];
  limit: number;
  next_marker?: string;
  offset: number;
  order: { by: string; direction: string }[];
  prev_marker?: string;
  total_count: number;
};

type BoxItem = {
  id: string;
  type: 'file' | 'folder';
  etag: string;
  sequence_id: string;
  name: string;
};
