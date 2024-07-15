export type BoxSharedLinkOutput = {
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

export type BoxSharedLinkInput = Partial<BoxSharedLinkOutput>;
