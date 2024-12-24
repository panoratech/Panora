/**
 * Common types for Google Drive permissions
 */
type PermissionRole =
  | 'owner'
  | 'organizer'
  | 'fileOrganizer'
  | 'writer'
  | 'commenter'
  | 'reader';

type PermissionType = 'user' | 'group' | 'domain' | 'anyone';

/**
 * Represents a Google Drive permission resource.
 * @see https://developers.google.com/drive/api/reference/rest/v3/permissions#Permission
 */
export interface GoogledrivePermissionOutput {
  /** The type of the grantee */
  type?: PermissionType;

  /** The role granted by this permission */
  role?: PermissionRole;

  /** The email address or domain of the entity granted access */
  emailAddress?: string;

  /** The domain to which this permission refers */
  domain?: string;

  /** Whether the permission allows the file to be discovered through search */
  allowFileDiscovery?: boolean;
  /** The ID of this permission */
  id: string;

  /** A displayable name for users, groups or domains */
  displayName?: string;

  /** A link to the user's profile photo, if available */
  photoLink?: string;

  /** Whether the account associated with this permission has been deleted */
  deleted: boolean;

  /** The time at which this permission was created (RFC 3339 date-time) */
  createdTime?: string;

  /** The "pretty" name of the value of the permission */
  permissionDetails?: Array<{
    permissionType: 'file' | 'member';
    role: 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
    inheritedFrom?: string;
    inherited?: boolean;
  }>;

  /** Details about any view or edit links that may exist for the file */
  view?: {
    viewType: string;
    viewLink?: string;
  };

  /** Additional metadata about the permission */
  [key: string]: any;
}

export type GoogledrivePermissionInput = Partial<GoogledrivePermissionOutput>;
