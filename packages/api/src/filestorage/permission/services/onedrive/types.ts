import {
  Identity,
  IdentitySet,
} from '@filestorage/drive/services/onedrive/types';
import { ItemReference } from '@filestorage/folder/services/onedrive/types';

/**
 * Represents a permission associated with a folder item.
 * @see https://learn.microsoft.com/en-us/graph/api/driveitem-invite?view=graph-rest-1.0&tabs=http
 */
export interface OnedrivePermissionOutput {
  /** The unique identifier of the permission among all permissions on the item. */
  id?: string;
  /** Indicates whether the password is set for this permission. */
  hasPassword?: boolean;
  /** For link type permissions, the details of the users to whom permission was granted. */
  grantedToV2?: SharePointIdentitySet;
  /** Provides a reference to the ancestor of the current permission, if it's inherited from an ancestor. */
  inheritedFrom?: ItemReference;
  /** Details of any associated sharing invitation for this permission. */
  invitation?: SharingInvitation;
  /** Provides the link details of the current permission, if it's a link type permission. */
  link?: SharingLink;
  /** The type of permission, for example, read. */
  roles?: ('read' | 'write' | 'owner')[];
  /** A unique token that can be used to access this shared item via the shares API. */
  shareId?: string;
  /** A format of yyyy-MM-ddTHH:mm:ssZ of DateTimeOffset indicates the expiration time of the permission. DateTime.MinValue indicates there's no expiration set for this permission. Optional. */
  expirationDateTime?: string;

  // INTERNAL
  internal_user_id?: string;
  internal_group_id?: string;
}

/**
 * Represents the sharing invitation details for a permission.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/sharinginvitation?view=graph-rest-1.0
 */
export interface SharingInvitation {
  /** The email address of the recipient. */
  readonly email?: string;
  /**  Provides information about who sent the invitation that created this permission, if that information is available. Read-only. */
  readonly readonlyinvitedBy?: IdentitySet;
  /** If true the recipient of the invitation needs to sign in in order to access the shared item. Read-only. */
  readonly signInRequired?: boolean;
}

/**
 * Represents the sharing link details for a permission.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/sharinglink?view=graph-rest-1.0
 */
export interface SharingLink {
  /** The URL that opens the item in the browser on the OneDrive website. */
  webUrl?: string;
  /** The type of sharing link. */
  type?: 'view' | 'edit' | 'embed';
  /** The scope of the link represented by this permission. */
  scope?: 'anonymous' | 'organization' | 'existingAccess' | 'users';
  /** If true, then the user can only use this link to view the item on the web, and cannot use it to download the contents of the item. */
  preventsDownload?: boolean;
  /** For embed links, this property contains the HTML code for an <iframe> element that will embed the item in a webpage. */
  webHtml?: string;
  /** The app the link is associated with. */
  application?: Identity;
}

/**
 * Represents the identity set in SharePoint.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/sharepointidentityset?view=graph-rest-1.0
 */
export interface SharePointIdentitySet extends IdentitySet {
  /** TThe SharePoint group associated with this action. Optional. */
  siteGroup?: Identity;
  /** The SharePoint user associated with this action. Optional. */
  siteUser?: Identity;
}

/**
 * Represents request body for permissions
 * @see https://learn.microsoft.com/en-us/graph/api/driveitem-invite?view=graph-rest-1.0&tabs=http
 */
export interface OnedrivePermissionInput {
  /** A plain text formatted message that is included in the sharing invitation. Maximum length 2000 characters. */
  message?: string;
  /** Specifies whether the recipient of the invitation is required to sign-in to view the shared item. */
  requireSignIn?: boolean;
  /** If true, a sharing link is sent to the recipient. Otherwise, a permission is granted directly without sending a notification. */
  sendInvitation?: boolean;
  /** Specifies the roles that are to be granted to the recipients of the sharing invitation. */
  roles: ('read' | 'write' | 'owner')[];
  /** Specifies the dateTime after which the permission expires. For OneDrive for Business and SharePoint, xpirationDateTime is only applicable for sharingLink permissions. Available on OneDrive for Business, SharePoint, and premium personal OneDrive accounts. */
  expirationDateTime?: string;
  /** The password set on the invite by the creator. Optional and OneDrive Personal only. */
  password?: string;
  /** Optional. If true (default), any existing inherited permissions are retained on the shared item when sharing this item for the first time. If false, all existing permissions are removed when sharing for the first time. */
  retainInheritedPermissions?: boolean;
  /** A collection of recipients who will receive access and the sharing invitation. */
  recipients?: DriveRecipient[];
}

/**
 * Represents a person, group, or other recipient to share a drive item with using the invite action.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/driverecipient?view=graph-rest-1.0
 */
export interface DriveRecipient {
  /** The alias of the domain object, for cases where an email address is unavailable (e.g. security groups). */
  alias?: string;
  /** The email address for the recipient, if the recipient has an associated email address. */
  email?: string;
  /** The unique identifier for the recipient in the directory. */
  objectId?: string;
}
