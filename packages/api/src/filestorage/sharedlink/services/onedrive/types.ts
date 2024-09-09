import { OnedrivePermissionOutput } from '@filestorage/permission/services/onedrive/types';

/**
 * Represents the input required to create a sharing link for a OneDrive item.
 * @see https://learn.microsoft.com/en-us/graph/api/driveitem-createlink?view=graph-rest-1.0&tabs=http#request-body
 */
export interface OnedriveSharedLinkInput {
  /** The type of sharing link to create. Possible values: view, edit, or embed. */
  type: string;

  /** The password of the sharing link that is set by the creator. Optional and applicable to OneDrive Personal only. */
  password?: string;

  /** A String with format yyyy-MM-ddTHH:mm:ssZ indicating the expiration time of the permission. */
  expirationDateTime: string;

  /**
   * If true (default), inherited permissions are retained on the shared item when sharing for the first time.
   * If false, all existing permissions are removed when sharing for the first time. Optional.
   */
  retainInheritedPermissions?: boolean;

  /** The scope of the link to create. Possible values: anonymous, organization, or users. Optional. */
  scope?: string;
}

// Creating a sharing link in onedrive returns a permission.
// ref: https://learn.microsoft.com/en-us/graph/api/driveitem-createlink?view=graph-rest-1.0&tabs=http#response
export type OnedriveSharedLinkOutput = Partial<OnedrivePermissionOutput>;
